const fetch = require('axios');

const TEST_DATA = {
    serverUrl: 'http://localhost:5000/api/v1',
    storageName: 'test',
    email: 'test@test.com',
    dayspan: 1,
    secretKey: null,
    accessToken: null,
    file: Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64'),
    fileOptions: {
        thumb: true,
        format: true,
        versions: true,
    },
    fileStat: {
        name: null,
        size: null,
        created_at: null,
        updated_at: null,
    },
    fileLinks: {

    },
};

/*
create storage
restore access
add file
list storage
get served file
deletefile
delete storage
*/

fetch.defaults.baseURL = TEST_DATA.serverUrl;

describe('storage api', () => {
    let file;
    beforeEach(() => {
        file = (new FormData()).append('file', 'TEST_DATA.file');
    });

    test('create', async () => {
        const { data } = await fetch.post('/new', {
            name: TEST_DATA.storageName,
            email: TEST_DATA.email,
            dayspan: TEST_DATA.dayspan,
        });

        TEST_DATA.secretKey = data.data.secretKey;
        TEST_DATA.accessToken = data.data.accessToken;
        expect(data).toMatchObject({
            ok: true,
            data: {
                secretKey: TEST_DATA.secretKey,
                accessToken: TEST_DATA.accessToken,
                storageName: TEST_DATA.storageName,
            },
        });
    });

    test('restore access', async () => {
        const { data } = await fetch.post('/restore', {
            name: TEST_DATA.storageName,
            email: TEST_DATA.email,
            dayspan: TEST_DATA.dayspan,
            secretKey: TEST_DATA.secretKey,
        });

        TEST_DATA.accessToken = data.data.accessToken;
        expect(data).toMatchObject({
            ok: true,
            data: {
                accessToken: TEST_DATA.accessToken,
            },
        });
    });

    test('add file', async () => {
        const { data } = await fetch({
            url: `/${TEST_DATA.storageName}`,
            method: 'post',
            data: file,
        });

        TEST_DATA.fileLinks = data.data;
        expect(data).toMatchObject({
            ok: true,
            data: TEST_DATA.fileLinks,
        });
    });

    test('list files', async () => {
        const { data } = await fetch({
            url: `/${TEST_DATA.storageName}`,
            method: 'get',
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        TEST_DATA.fileStat = data.data[0];
        expect(data).toMatchObject({
            ok: true,
            data: [TEST_DATA.fileStat],
        });
    });

    // test('get file', async () => {
    //     const { data } = await fetch({
    //         url: `http:localhost:5000/${TEST_DATA.storageName}/${TEST_DATA.fileStat.name}`,
    //         method: 'get',
    //     });

    //     expect(data).toMatchObject({
    //         ok: true,
    //     });
    // });

    test('delete file', async () => {
        const { data } = await fetch({
            url: `/${TEST_DATA.storageName}/${TEST_DATA.fileStat.name}`,
            method: 'delete',
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        expect(data).toMatchObject({
            ok: true,
        });
    });

    test('delete', async () => {
        const { data } = await fetch({
            url: `/${TEST_DATA.storageName}`,
            method: 'delete',
            headers: {
                'x-access-token': TEST_DATA.accessToken,
            },
        });

        expect(data).toMatchObject({
            ok: true,
        });
    });
});

