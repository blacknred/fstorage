const stream = require('stream');
const request = require('request');
const promisify = require('util').promisify;

//  --forceExit --detectOpenHandles
const TEST_DATA = {
    serverUrl: 'http://localhost:5001/api/v1',
    storageName: 'test',
    email: 'test@test.com',
    tokenDayout: 1,
    secretKey: null,
    accessToken: null,
    file: Buffer.alloc(5000000),
    streamFile: 'https://nodejs.org/static/images/logo.svg',
    fileName: null,
    newFileName: 'zizoo.jpg',
};
const through = new stream.PassThrough();
through.push(TEST_DATA.file); // Buffer.from('data:image/jpeg;base64', 'binary')
through.push(null);
// through.end();

/*
create storage
restore storage access
update storage
add files to storage
list storage
get file
update file
delete file
delete storage
*/

const fetch = promisify(request.defaults({
    baseUrl: TEST_DATA.serverUrl,
    json: true,
    timeout: 20000,
}));

describe('FStorage api', () => {
    test('create storage', async () => {
        const data = await fetch({
            uri: '/new',
            method: 'POST',
            form: {
                name: TEST_DATA.storageName,
                email: TEST_DATA.email,
                tokenDayout: TEST_DATA.tokenDayout,
            },
        });

        TEST_DATA.secretKey = data.body.data.secretKey;
        TEST_DATA.accessToken = data.body.data.accessToken;
        expect(data.body).toMatchObject({
            ok: true,
            data: {
                secretKey: TEST_DATA.secretKey,
                accessToken: TEST_DATA.accessToken,
                name: TEST_DATA.storageName,
            },
        });
    });

    test('restore access', async () => {
        const data = await fetch({
            uri: '/token',
            method: 'POST',
            form: {
                name: TEST_DATA.storageName,
                email: TEST_DATA.email,
                tokenDayout: TEST_DATA.tokenDayout,
                secretKey: TEST_DATA.secretKey,
            },
        });

        TEST_DATA.accessToken = data.body.data.accessToken;
        expect(data.body).toMatchObject({
            ok: true,
            data: {
                accessToken: TEST_DATA.accessToken,
            },
        });
    });

    test('update storage', async () => {
        const data = await fetch({
            uri: `/${TEST_DATA.storageName}`,
            method: 'PUT',
            form: {
                empty: true,
                private: true,
            },
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        expect(data.body).toMatchObject({
            ok: true,
        });
    });

    test('add files', async () => {
        const data = await Promise.all([
            fetch({
                uri: `${TEST_DATA.storageName}`,
                method: 'POST',
                formData: {
                    file: {
                        value: TEST_DATA.file,
                        options: {
                            filename: 'test1_img',
                            contentType: 'image/jpeg'
                        },
                    },
                },
                headers: {
                    'x-access-token': TEST_DATA.accessToken,
                },
            }),
            fetch.post({
                uri: `${TEST_DATA.storageName}`,
                method: 'POST',
                formData: {
                    file: {
                        value: TEST_DATA.file,
                        options: {
                            filename: 'test_video',
                            contentType: 'video/mp4'
                        },
                    },
                },
                headers: {
                    'x-access-token': TEST_DATA.accessToken,
                },
            }),
        ]);

        expect(data[0].body).toMatchObject({
            ok: true,
            data: data[0].body.data,
        });
    }, 20000);

    test('streaming file to storage', () => {
        request.post(`${TEST_DATA.serverUrl}/${TEST_DATA.storageName}`, {
            formData: {
                file: {
                    value: request.get(TEST_DATA.streamFile),
                    options: {
                        filename: 'topsecret.avi',
                    }
                }
            },
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        })
        .on('response', (m) => {
            console.log('dooone', Object.keys(m));
            expect({}).toMatchObject({});
            // done();
        });
    }, 50000);

    test('get storage', async () => {
        const data = await fetch({
            method: 'get',
            uri: `/${TEST_DATA.storageName}`,
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        TEST_DATA.fileName = data.body.data[0].name;
        expect(data.body).toMatchObject({
            ok: true,
            data: data.body.data
        });
    });

    test('get file', async () => {
        const data = await fetch({
            uri: `/${TEST_DATA.storageName}/${TEST_DATA.fileName}`,
            method: 'get',
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        expect(data.body).toMatchObject({
            ok: true,
        });
    });

    test('update file', async () => {
        const data = await fetch({
            uri: `/${TEST_DATA.storageName}/${TEST_DATA.fileName}`,
            method: 'put',
            form: {
                name: TEST_DATA.newFileName,
                private: true,
            },
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        TEST_DATA.fileName = data.body.data;
        expect(data.body).toMatchObject({
            ok: true,
        });
    });

    // test('delete file', async () => {
    //     const data = await fetch({
    //         uri: `/${TEST_DATA.storageName}/${TEST_DATA.fileName}`,
    //         method: 'delete',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data.body).toMatchObject({
    //         ok: true,
    //     });
    // });

    // test('delete storage', async () => {
    //     const data = await fetch({
    //         uri: `/${TEST_DATA.storageName}`,
    //         method: 'delete',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data.body).toMatchObject({
    //         ok: true,
    //     });
    // });
});
