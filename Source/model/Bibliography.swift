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

    var objectWillChange = CurrentValueSubject<[Conspectus], Never>([])

    func has(_ id: UID) -> Bool {
        return dict[id] != nil
    }

    func add(_ c: Conspectus) {
        if !has(c.id) {
            dict[c.id] = c
            objectWillChange.send(getValues())
        }
    }

    func remove(_ c: Conspectus) {
        if has(c.id) {
            dict.removeValue(forKey: c.id)
            objectWillChange.send(getValues())
        }
    }

    func getValues() -> [Conspectus] {
        return Array(dict.values)
    }
}
