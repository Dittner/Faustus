from pathlib import Path


def list_all_files(p: Path):
    if p.name.startswith('.'):
        return
    if p.is_file():
        if p.suffix == '.txt':
            yield p
    else:
        for child in p.iterdir():
            yield from list_all_files(child)

def list_all_dirs(p: Path):
    if p.name.startswith('.'):
        return
    if p.is_dir():
        for child in p.iterdir():
            yield from list_all_dirs(child)
        yield p


def ch_name_to_alias(root: Path):
    if not root.exists():
        print(f'File {root.as_posix()} not found')
        return
    for p in list_all_files(root):
        if not p.exists():
            print(f'File "{p.as_posix()}" dose not exist!')
            return
        changed = False
        res = []
        with p.open('rt') as f:
            while True:
                row = f.readline()
                if row == '':
                    break
                if row == '[NAME]\n':
                    changed = True
                    res.append('[ALIAS]\n')
                    res.extend(f.readlines())
                    break
        if changed:
            with p.open('wt') as f:
                f.write(''.join(res))
                print(f'File "{p.as_posix()}" changed')

def ch_img_dir_to_assets(root: Path):
    if not root.exists():
        print(f'File {root.as_posix()} not found')
        return
    for p in list_all_dirs(root):
        if p.name == 'img':
            to = p.with_name('assets')
            p.rename(to)
            print(f'Dir "{p.as_posix()}", renamed to: {to.as_posix()}')


if __name__ == '__main__':
    ch_img_dir_to_assets(Path('data/index'))
