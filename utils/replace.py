import re
from pathlib import Path

ROOT_DIR_PATH = Path('data')

if not ROOT_DIR_PATH.exists():
    Path.mkdir(ROOT_DIR_PATH)


def run(d: Path, level:int):
    print(f'{'  ' * level}Dir: {d.relative_to(ROOT_DIR_PATH).as_posix()}')
    count = 0
    for p in d.iterdir():
        if p.is_dir() and not p.stem.startswith('.'):
            run(p, level + 1)
        elif p.is_file() and not p.stem.startswith('.') and p.suffix == '.txt':
            text = read_file(p)
            res = re.sub(r'^\$#', '#', text, flags=re.MULTILINE)
            rewrite_file(p, res)
            msg = 'OK' if res != text else 'Not changed'
            count += 1
            print(f'{'  ' * level}{count}: {msg}, {p.relative_to(ROOT_DIR_PATH).as_posix()}')


def read_file(p: Path) -> str:
    with p.open() as f:
        return f.read()


def rewrite_file(p: Path, text: str):
    with p.open('wt') as f:
        f.write(text)


if ROOT_DIR_PATH.exists():
    run(ROOT_DIR_PATH, 0)
else:
    print(f'Root dir not found: {ROOT_DIR_PATH}')
