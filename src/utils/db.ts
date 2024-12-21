// db.js
export function openDB() {
    const request = indexedDB.open('myDatabase', 1);

    request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('fileStore')) {
            db.createObjectStore('fileStore', { keyPath: 'id' });
        }
    };

    request.onerror = (event) => {
        // 检查 event.target 是否为 null
        const target = event.target as IDBRequest;
        if (target) {
            console.error('Error deleting data:', target.error);
        } else {
            console.error('Error deleting data: Event target is null');
        }
    };

    request.onsuccess = (event) => {

        const db = (event.target as IDBOpenDBRequest).result;
        // 数据库打开成功，你可以在这里执行其他操作
        db
    };

    return request;
}

export function addDataToIDB(fileId:string, chunkData:File) {
    const request = openDB();
    request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['fileStore'], 'readwrite');
        const store = transaction.objectStore('fileStore');
        const data = {
            id: fileId ,
            blob: chunkData
        };
        store.add(data);
    };
}

export function getDataFromIDB(fileid:string) {
    const request = openDB();
    return new Promise((resolve:(value:File)=>void)=>{
        let result
        request.onsuccess = (event) => {  
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['fileStore'], 'readonly');
            const store = transaction.objectStore('fileStore');
            const dataRequest = store.get(fileid);
            dataRequest.onsuccess = (event) => {
                if ((event.target as IDBOpenDBRequest).result) {
                    // 这里获取到了分片数据
                    const chunkData = (event.target as any).result.blob;
                    // console.log(event.target.result)
                    result = chunkData
                    resolve(result)
                }
            };
        };
    })
}

export function deleteDataFromIDB(fileId:string) {
    const request = openDB();
    request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['fileStore'], 'readwrite');
        const store = transaction.objectStore('fileStore');
        // 使用 delete 方法删除数据
        const requestDelete = store.delete(fileId);
        requestDelete.onsuccess = () => {
            console.log('Data deleted successfully');
        };
        requestDelete.onerror = (event) => {
            // 检查 event.target 是否为 null
            const target = event.target as IDBRequest;
            if (target) {
                console.error('Error deleting data:', target.error);
            } else {
                console.error('Error deleting data: Event target is null');
            }
        };
    };
}