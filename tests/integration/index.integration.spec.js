const sharp = require('sharp');
const fs = require('fs');
const requestP = require('request-promise');

const TEST_DATA = {
    serverUrl: 'http://localhost:5000/api/v1',
    storageName: 'test',
    email: 'test@test.com',
    tokenDayout: 1,
    secretKey: null,
    accessToken: null,
    imagefile: sharp({
        create: {
            width: 300,
            height: 400,
            channels: 4,
            background: {
                r: 255,
                g: 0,
                b: 0,
                alpha: 0.5,
            }
        }
    }).jpeg().toBuffer(),
    videoFile: 'http://file-examples.com/wp-content/uploads/2018/04/file_example_AVI_480_750kB.avi',
    documentFile: 'http://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf',
    fileName: null,
    newFileName: 'zizoo.jpg',
};

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

const request = requestP.defaults({
    baseUrl: TEST_DATA.serverUrl,
    json: true,
    timeout: 20000,
});

describe('FStorage api', () => {
    test('create storage', async () => {
        const data = await request('/new', {
            method: 'post',
            form: {
                name: TEST_DATA.storageName,
                email: TEST_DATA.email,
                tokenDayout: TEST_DATA.tokenDayout,
            },
        });

        TEST_DATA.secretKey = data.data.secretKey;
        TEST_DATA.accessToken = data.data.accessToken;
        expect(data).toMatchObject({
            ok: true,
            data: {
                secretKey: TEST_DATA.secretKey,
                accessToken: TEST_DATA.accessToken,
                name: TEST_DATA.storageName,
            },
        });
    });

    // test('restore access', async () => {
    //     const data = await request('/token', {
    //         method: 'post',
    //         form: {
    //             name: TEST_DATA.storageName,
    //             email: TEST_DATA.email,
    //             tokenDayout: TEST_DATA.tokenDayout,
    //             secretKey: TEST_DATA.secretKey,
    //         },
    //     });

    //     TEST_DATA.accessToken = data.data.accessToken;
    //     expect(data).toMatchObject({
    //         ok: true,
    //         data: {
    //             accessToken: TEST_DATA.accessToken,
    //         },
    //     });
    // });

    // test('update storage', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}`, {
    //         method: 'put',
    //         form: {
    //             empty: true,
    //             private: true,
    //         },
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });

    test('add files', async () => {
        const value = await TEST_DATA.imagefile;
        const data = await Promise.all([
            request(`${TEST_DATA.storageName}?f=tiff&w=100`, {
                method: 'post',
                formData: {
                    file: {
                        value,
                        options: {
                            filename: 'test1_img',
                            contentType: 'image/jpg'
                        },
                    },
                },
                headers: {
                    'x-access-token': TEST_DATA.accessToken,
                },
            }),
            request(`${TEST_DATA.storageName}?f=webp&w=20&h=70`, {
                method: 'post',
                formData: {
                    file: {
                        value,
                        options: {
                            filename: 'test_img',
                            contentType: 'image/jpg'
                        },
                    },
                },
                headers: {
                    'x-access-token': TEST_DATA.accessToken,
                },
            }),
            // request(`${TEST_DATA.storageName}?`, {
            //     method: 'post',
            //     formData: {
            //         file: {
            //             value: await requestP.get(TEST_DATA.documentFile),
            //             options: {
            //                 filename: 'test_pdf',
            //                 contentType: 'application/pdf'
            //             },
            //         },
            //     },
            //     headers: {
            //         'x-access-token': TEST_DATA.accessToken,
            //     },
            // }),
            request(`${TEST_DATA.storageName}?f=webm`, {
                method: 'post',
                formData: {
                    file: {
                        value: fs.createReadStream(__dirname + '/1.avi'),
                        options: {
                            filename: 'test_video',
                            contentType: 'video/avi'
                        }
                    },
                },
                headers: {
                    'x-access-token': TEST_DATA.accessToken,
                },
            }),
        ]);

        console.log(data);
        expect(data[0]).toMatchObject({
            ok: true,
            data: data[0].data,
        });
    }, 50000);

    // test('get storage', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}`, {
    //         method: 'get',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     TEST_DATA.fileName = data.data[0].name;
    //     expect(data).toMatchObject({
    //         ok: true,
    //         data: data.data
    //     });
    // });

    // test('get file', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}/${TEST_DATA.fileName}`, {
    //         method: 'get',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });

    // test('update file', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}/${TEST_DATA.fileName}`, {
    //         method: 'put',
    //         form: {
    //             name: TEST_DATA.newFileName,
    //             private: true,
    //         },
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     TEST_DATA.fileName = data.data;
    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });

    // test('delete file', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}/${TEST_DATA.fileName}`, {
    //         method: 'delete',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });

    // test('delete', async () => {
    //     const data = await request(`/${TEST_DATA.storageName}`, {
    //         method: 'delete',
    //         headers: {
    //             'x-access-token': TEST_DATA.accessToken,
    //         },
    //     });

    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });
});
