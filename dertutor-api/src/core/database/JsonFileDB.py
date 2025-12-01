import json
from pathlib import Path
from typing import Any


class JsonFileDB:
    def __init__(self, db_path: Path) -> None:
        self.db_file_path = db_path
        self.db_file = None
        self.hash: dict[str, Any] = {}

    def connect(self):
        self.hash = {}

        if not self.db_file_path.exists:
            f = self.db_file_path.open('w')
            f.close()

        with self.db_file_path.open('rt') as file:
            data = json.loads(file.read())
            file.seek(0, 2)
            print(f'JsonFileDB file size: {file.tell()} bytes, {file.tell() / 1024 / 1024} Mb')
            for item in data:
                self.hash[item['key']] = item
        self.store()

    def has(self, key: str) -> bool:
        return self.hash.get(key) != None

    def read(self, key: str) -> Any | None:
        return self.hash.get(key)

    def remove(self, key: str):
        del self.hash[key]

    def store(self):
        with self.db_file_path.open('wt') as file:
            data = json.dumps(list(self.hash.values()), ensure_ascii=False)
            file.write(data)

    def close(self):
        pass
