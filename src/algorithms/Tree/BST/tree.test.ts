import Tree from "./tree";

export const fn = () => {
    const bsTree = new Tree();

    bsTree.insert(8);
    bsTree.insert(4);
    bsTree.insert(12);
    bsTree.insert(78);
    bsTree.insert(24);
    const res = bsTree.insert(15);
    console.log('insert', res.path.map(_item => _item.value));

    console.log('--------------------');
    const s = bsTree.search(15);
    console.log('search', s?.path.map(_item => _item.value) ?? []);
    console.log('search parent', s?.parent?.value);

    console.log('--------------------');
    bsTree.delete(78);
    const s2 = bsTree.search(15);
    console.log('search 15', s2?.path.map(_item => _item.value) ?? []);
    console.log('search parent', s2?.parent?.value);

    console.log('--------------------');
    const _prePath: any[] = []
    bsTree.preOrderTraversal(bsTree.root, val => _prePath.push(val))
    console.log('pre order', _prePath);

    console.log('--------------------');
    const _inOrderPath: any[] = []
    bsTree.inOrderTraversal(bsTree.root, val => _inOrderPath.push(val))
    console.log('in order', _inOrderPath);

    console.log('--------------------');
    const _portOrderPath: any[] = []
    bsTree.postOrderTraversal(bsTree.root, val => _portOrderPath.push(val))
    console.log('post order', _portOrderPath);
}