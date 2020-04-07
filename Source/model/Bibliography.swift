//
//  Note.swift
//  Faustus
//
//  Created by Alexander Dittner on 23.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

final class Bibliography: ObservableObject {
    private var dict: [UID: Conspectus] = [:]
    private var uniqueNames: [String: UID] = [:]

    var objectWillChange = CurrentValueSubject<[Conspectus], Never>([])

    func has(_ id: UID) -> Bool {
        return dict[id] != nil
    }

    func write(_ c: Conspectus) {
        if !has(c.id) {
            dict[c.id] = c
            uniqueNames[c.content.getUniqueName()] = c.id
            objectWillChange.send(getValues())
        }
    }

    func read(_ id: UID) -> Conspectus? {
        return dict[id]
    }

    func remove(_ c: Conspectus) {
        if has(c.id) {
            dict.removeValue(forKey: c.id)
            uniqueNames.removeValue(forKey: c.content.getUniqueName())
            objectWillChange.send(getValues())
        }
    }

    func getValues() -> [Conspectus] {
        return Array(dict.values)
    }

    func update(_ c: Conspectus, oldUniqueName: String) {
        uniqueNames.removeValue(forKey: oldUniqueName)
        uniqueNames[c.content.getUniqueName()] = c.id
    }

    func hasDuplicate(of c: Conspectus) -> Bool {
        if let duplicateID = uniqueNames[c.content.getUniqueName()] {
            return c.id != duplicateID
        } else {
            return false
        }
    }
}
