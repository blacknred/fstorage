const stream = require('stream');
const Storage = require('.');

let key;
const bufferFile = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
const readStream = (new stream.PassThrough()).end(bufferFile);

describe('FStorage class', () => {
    beforeAll(() => {
        Storage.setDefaultOpts({
            root_path: './storage',
            is_gzip: true,
            is_uid_key: false,
        });
    });

    it('create new storage', () => {
        const storage = new Storage('test');
        expect(storage).toBeInstanceOf(Storage);
        key = storage.key;
        expect(storage.name).toBe('test');
        expect(storage.isPrivate).toBe(false);
        expect(storage.key).toBe(key);
    });

    it('static: find new storage and return instance', () => {
        const storage = Storage.find('test');
        expect(storage).toBeInstanceOf(Storage);
        expect(storage.name).toBe('test');
        expect(storage.isPrivate).toBe(false);
        expect(storage.key).toBe(key);
    });

    it('static: check existance', () => {
        expect(Storage.exists('test')).toBe('test');
        expect(Storage.exists('tests')).toBe(false);
    });

    it('work with files', async () => {
        const storage = Storage.find('test');
        const c1 = await storage.count;
        expect(c1).toBe(0);
        readStream.pipe(storage.putStream('my_file_03.jpg'));
        const f1 = await storage.put(bufferFile, 'my_file_01.jpg');
        const f2 = await storage.put(bufferFile, 'my_file_02.jpg');
        const c2 = await storage.count;
        expect(c2).toBe(3);
        const stat = await storage.stat(f1);
        expect(stat.name).toBe('my_file_01.jpg');
        await storage.pop(f1);
        const c3 = await storage.count;
        expect(c3).toBe(2);
        await storage.hide(f2);
        const p = Storage.exists(storage.name, f2);
        expect(p).toBe('.my_file_02.jpg.gz');
        await storage.unhide(f2);
        const n = await storage.rename(f2, 'new_file_02');
        expect(n).toBe('new_file_02.jpg');
    });

    it('work with storage', async () => {
        const storage = Storage.find('test');
        const l = await storage.list();
        expect(l[0].name).toBe('my_file_03.jpg.gz');
        await storage.private();
        expect(storage.isPrivate).toBe(true);
        const p = Storage.exists(storage.name);
        expect(p).toBe('.test');
        await storage.public();
        await storage.clear();
        const c = await storage.count;
        expect(c).toBe(0);
        await storage.destroy();
    });
});
