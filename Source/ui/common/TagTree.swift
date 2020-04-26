//
//  TagTree.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

class TagTree {
    private(set) var rootTagList: [Tag]!

    init(_ tags: [Tag]) {
        rootTagList = tags.filter { $0.content.parentTag == nil }
    }

    func flatTree(_ filter: ((Tag) -> Bool)? = nil) -> [Tag] {
        var res: [Tag] = []

        for tag in rootTagList {
            res.append(contentsOf: fillNodeList(with: tag, filter: filter))
        }

        return res
    }

    private func fillNodeList(with node: Tag, filter: ((Tag) -> Bool)?) -> [Tag] {
        guard filter == nil || filter!(node) else { return [] }

        var res: [Tag] = []
        res.append(node)
        for node in node.content.children {
            res.append(contentsOf: fillNodeList(with: node, filter: filter))
        }

        return res
    }
}
