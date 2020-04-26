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
            if !c.state.isNew {
                uniqueNames[c.getHashName()] = c.id
            }
            objectWillChange.send(getValues())
        }
    }

    func read(_ id: UID) -> Conspectus? {
        return dict[id]
    }

    func remove(_ c: Conspectus) {
        if has(c.id) {
            dict.removeValue(forKey: c.id)
            uniqueNames.removeValue(forKey: c.getHashName())
            objectWillChange.send(getValues())
        }
    }

    func getValues() -> [Conspectus] {
        return Array(dict.values)
    }

    func update(_ c: Conspectus, oldHashName: String) {
        uniqueNames.removeValue(forKey: oldHashName)
        uniqueNames[c.getHashName()] = c.id
    }

    func updateHashNames() {
        uniqueNames = [:]
        for c in getValues() {
            uniqueNames[c.getHashName()] = c.id
        }
    }

    func hasDuplicate(of c: Conspectus) -> Bool {
        if let duplicateID = uniqueNames[c.getHashName()] {
            return c.id != duplicateID
        } else {
            return false
        }
    }
}
