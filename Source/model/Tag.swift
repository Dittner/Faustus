//
//  Tag.swift
//  Faustus
//
//  Created by Alexander Dittner on 04.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

class Tag: ObservableObject, Storable {
    let id: UID
    @Published var name: String = ""
    @Published var info: String = "Keine"
    @Published var parentTagID: UID?
    @Published var hasChanges: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    required init(id: UID) {
        self.id = id

        for prop in [$name, $info] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }

        $parentTagID
            .removeDuplicates()
            .map { _ in
                true
            }
            .assign(to: \.hasChanges, on: self)
            .store(in: &disposeBag)
    }

    func hasChangesToStore() -> Bool {
        hasChanges
    }

    func didStore() {
        hasChanges = false
    }
    
    func didConspectusChange() {
        hasChanges = true
    }

    func validate() -> ValidationStatus {
        if name.isEmpty { return .emptyName }
        return .ok
    }

    func serialize() -> [String: Any] {
        var dict: [String: Any] = ["id": id,
                                   "name": name,
                                   "info": info
        ]

        if let superTagID = parentTagID {
            dict["parentTagID"] = superTagID
        }
        return dict
    }

    func deserialize(from dict: [String: Any]) {
        name = dict["name"] as? String ?? ""
        info = dict["info"] as? String ?? ""
        parentTagID = dict["parentTagID"] as? UID
        hasChanges = false
    }
}

extension Conspectus {
    var asTag: Tag? { return content as? Tag }
}
