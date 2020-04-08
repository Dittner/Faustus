//
//  TagTreeController.swift
//  Faustus
//
//  Created by Alexander Dittner on 09.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class TagTreeController: ViewModel {
    @Published var conspectus: Conspectus!
    @Published var tagTree: TagTree!
    @Published var needTagTreeUpdate: Bool = false
    private var initialParentTagID: UID? = nil
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest($needTagTreeUpdate, model.bibliography.objectWillChange)
            .map { _, conspectusList in
                conspectusList.filter { $0.genus == .asTag }
            }
            .map { conspectusList in
                conspectusList.sorted {
                    $0.asTag!.name < $1.asTag!.name
                }
            }
            .map { conspectusList in
                logInfo(tag: .APP, msg: "New TagTree")
                return TagTree(conspectusList)
            }
            .assign(to: \.tagTree, on: self)
            .store(in: &disposeBag)
    }

    func update(conspectus: Conspectus) {
        if isParentTagChanged() {
            needTagTreeUpdate = true
        }
        
        self.conspectus = conspectus

        if let tag = conspectus.asTag {
            initialParentTagID = tag.parentTag?.id
        }
    }

    func isParentTagChanged() -> Bool {
        if let tag = self.conspectus?.asTag, tag.parentTag?.id != self.initialParentTagID {
            return true
        } else {
            return false
        }
    }
}

class TagTreeNode {
    private(set) var id: UID!
    private(set) var tag: Tag!
    var conspectus: Conspectus! {
        didSet {
            id = conspectus.id
            tag = conspectus.asTag!
        }
    }

    var parent: TagTreeNode?
    var children: [TagTreeNode]?
    var level = 0
    var isFirst = false
    var isLast = false
}

class TagTree {
    private(set) var nodeList: [TagTreeNode]!
    private(set) var nodeHash: [UID: TagTreeNode] = [:]

    init(_ conspectusList: [Conspectus]) {
        for conspectus in conspectusList {
            let node = nodeHash[conspectus.id] ?? TagTreeNode()
            nodeHash[conspectus.id] = node
            node.conspectus = conspectus

            if let parentTag = conspectus.asTag!.parentTag {
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
        let rootNodes: [TagTreeNode] = nodeHash.values.sorted { $0.tag!.name < $1.tag!.name }.filter { $0.parent == nil }

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
