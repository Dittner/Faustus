import array
from pathlib import Path

INT_SIZE = 4
META_DATA_SIZE = 1


class KeyValueDB:
    """DB Scheme:

    [meta_data (META_DATA_SIZE bytes),
    size_of_file_key (INT_SIZE bytes),
    encoded_file_key,
    size_of_file (INT_SIZE bytes),
    file_bytes]

    [meta_data (META_DATA_SIZE bytes),
    size_of_file_key (INT_SIZE bytes),
    encoded_file_key,
    size_of_file (INT_SIZE bytes),
    file_bytes]

    ...

    META_DATA contains one number: 0 if file is marked as deleted or 1 - otherwise
    """

    def __init__(self, db_path: Path) -> None:
        print('new KeyValueDB')
        self.db_file_path = db_path
        self.hash: dict[str, tuple[int, int, int]] = {}  # pos_of_record, pos_of_file_bytes, size_of_file
        self.max_bytes_len = 256 ** (array.array('I').itemsize) - 1
        self.db_file = None

    def connect(self):
        if self.db_file:
            return

        if not self.db_file_path.exists:
            f = self.db_file_path.open('w')
            f.close()

        with self.db_file_path.open('rb') as dbf:
            cursor = 0
            dbf.seek(0, 2)
            db_file_size = dbf.tell()
            total_size_of_deleted_files = 0
            while cursor < db_file_size:
                dbf.seek(cursor)
                status = int.from_bytes(dbf.read(META_DATA_SIZE), byteorder='little', signed=False)
                if status not in {0, 1}:
                    raise InvalidDBFileError(self.db_file_path.as_posix(), f'Invalid metadata value: {status}, expected 0 or 1.')

                key_len = int.from_bytes(dbf.read(INT_SIZE), byteorder='little', signed=False)
                key = dbf.read(key_len).decode()
                value_len = int.from_bytes(dbf.read(INT_SIZE), byteorder='little', signed=False)
                full_record_len = META_DATA_SIZE + INT_SIZE + key_len + INT_SIZE + value_len

                if self.hash.get(key):
                    raise InvalidDBFileError(self.db_file_path.as_posix(), f'Duplicated key {key} was found. Key should be unique.')

                if status == 1:
                    # print(f'Key:{key}, pos:{cursor + full_record_len - value_len}, size:{value_len}')
                    self.hash[key] = (cursor, cursor + full_record_len - value_len, value_len)
                else:
                    print(f'Key:{key}, pos:{cursor + full_record_len - value_len}, size:{value_len} (DELETED)')
                    total_size_of_deleted_files += META_DATA_SIZE + INT_SIZE + key_len + INT_SIZE + value_len

                cursor += full_record_len

            if total_size_of_deleted_files > 0:
                print(f'KeyValueDB: {total_size_of_deleted_files} bytes may be deleted by compression')

        self.db_file = self.db_file_path.open('r+b')
        self.db_file.seek(0, 2)
        print(f'DB file size: {self.db_file.tell()} bytes, {self.db_file.tell() / 1024 / 1024} Mb')

    def has(self, key: str):
        if not self.db_file:
            raise InvalidDBOperationError(details='KeyValueDB should be connected before writing!')
        return self.hash.get(key) != None

    def write(self, key: str, bb: bytes):
        if not self.db_file:
            raise InvalidDBOperationError(details='KeyValueDB should be connected before writing!')

        value_size = len(bb)
        if value_size == 0:
            raise InvalidFileSizeError(f'File <{key}> can not be empty')

        if value_size > self.max_bytes_len:
            raise InvalidFileSizeError(f'Size of <{key}>: {value_size} > maximum of unsigned integer ({self.max_bytes_len})')

        if self.hash.get(key):
            # raise InvalidDBOperationError(f'Key {key} is a duplicate. File can not be written.')
            print(f'KeyValueDB.write. Value with key:{key} allready exists.')
            return

        key_in_bytes = key.encode()
        file_status = 1
        self.db_file.seek(0, 2)  # move seek pointer to the end
        cursor_before = self.db_file.tell()
        # do not forget: write method changes cursor (seek position)
        self.db_file.write(file_status.to_bytes(META_DATA_SIZE, 'little'))
        self.db_file.write(len(key_in_bytes).to_bytes(INT_SIZE, 'little'))
        self.db_file.write(key_in_bytes)
        self.db_file.write(value_size.to_bytes(INT_SIZE, 'little'))
        self.db_file.write(bb)
        cursor_after = self.db_file.tell()

        self.hash[key] = (cursor_before, cursor_after - value_size, value_size)

    def read(self, key: str) -> bytes | None:
        if not self.db_file:
            raise InvalidDBOperationError(details='KeyValueDB should be connected before reading!')

        value = self.hash.get(key)
        if value:
            self.db_file.seek(value[1])
            return self.db_file.read(value[2])
        else:
            return None

    def remove(self, key: str) -> bool:
        if not self.db_file:
            raise InvalidDBOperationError(details='KeyValueDB should be connected before removing!')

        value = self.hash.get(key)
        if value:
            delete_status = 0
            self.db_file.seek(value[0])
            self.db_file.write(delete_status.to_bytes(META_DATA_SIZE, 'little'))
            del self.hash[key]
            return True
        else:
            return False

    def close(self):
        if self.db_file:
            self.db_file.close()


class KeyValueDBError(Exception):
    def __init__(self):
        super().__init__()


class InvalidDBFileError(KeyValueDBError):
    def __init__(self, path: str, details: str):
        super().__init__()
        self.path = path
        self.details = details

    def __str__(self):
        return f'Invalid db-file "{self.path}"! Details: {self.details}'


class InvalidDBOperationError(KeyValueDBError):
    def __init__(self, details: str):
        super().__init__()
        self.details = details

    def __str__(self):
        return f'Invalid operation! Details: {self.details}'


class InvalidFileSizeError(KeyValueDBError):
    def __init__(self, details: str):
        super().__init__()
        self.details = details

    def __str__(self):
        return f'File is empty or is too large! Details: {self.details}'
