//
//  TagTree.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

class TagTreeNode {
    var tag: Tag!
    var parent: TagTreeNode?
    var children: [TagTreeNode]?
    var level = 0
    var isFirst = false
    var isLast = false
}

class TagTree {
    private(set) var nodeList: [TagTreeNode]!
    private(set) var nodeHash: [UID: TagTreeNode] = [:]

    init(_ tags: [Tag]) {
        for t in tags {
            let node = nodeHash[t.id] ?? TagTreeNode()
            nodeHash[t.id] = node
            node.tag = t

            if let parentTag = t.content.parentTag {
                let parentNode = nodeHash[parentTag.id] ?? TagTreeNode()
                nodeHash[parentTag.id] = parentNode

                node.parent = parentNode

                if parentNode.children == nil {
                    parentNode.children = []
                }
                parentNode.children?.append(node)
            }
        }

        nodeList = compactTree()
    }

    func compactTree(_ filter: ((TagTreeNode) -> Bool)? = nil) -> [TagTreeNode] {
        var res: [TagTreeNode] = []
        let rootNodes: [TagTreeNode] = nodeHash.values.sorted { $0.tag.content.name < $1.tag.content.name }.filter { $0.parent == nil }

//        print("rootNodes:")
//        for n in rootNodes {
//            print("   \(n.tag.name), level: \(n.level)")
//        }

        for (ind, node) in rootNodes.enumerated() {
            res.append(contentsOf: fillNodeList(with: node, level: 0, filter: filter))
            if ind == 0 {
                node.isFirst = true
            }
            if ind == rootNodes.count - 1 {
                node.isLast = true
            }
        }

        return res
    }

    private func fillNodeList(with node: TagTreeNode, level: Int, filter: ((TagTreeNode) -> Bool)?) -> [TagTreeNode] {
        guard filter == nil || filter!(node) else { return [] }

        var res: [TagTreeNode] = []
        node.level = level
        res.append(node)
        if let children = node.children {
            for (ind, node) in children.enumerated() {
                res.append(contentsOf: fillNodeList(with: node, level: level + 1, filter: filter))

                if ind == 0 {
                    node.isFirst = true
                }
                if ind == children.count - 1 {
                    node.isLast = true
                }
            }
        }

        return res
    }
}
