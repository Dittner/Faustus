//
//  Book.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
class Book: ObservableObject, Storable {
    let id: UID
    @Published var hasChanges: Bool = false

    required init(id: UID) {
        self.id = id
    }

    @Published var title: String = ""

    func willStore() -> Bool {
        hasChanges
    }
    
    func didStore() {
        hasChanges = false
    }

    func validate() -> ValidationStatus {
        if title == "" { return .emptyBookTitle }
        return .ok
    }

    func serialize() -> [String: Any] {
        return ["id": id, "title": title]
    }

    func deserialize(from dict: [String: Any]) {
        title = dict["title"] as? String ?? ""
    }
}
