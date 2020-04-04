//
//  Storable.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
protocol Storable {
    func hasChangesToStore() -> Bool
    func didStore()
    func validate() -> ValidationStatus
    func serialize() -> [String: Any]
    func deserialize(from dict: [String: Any])
    init(id: UID)
}

enum ValidationStatus: String {
    case ok
    case emptyName = "Das Feld Name ist nicht gefüllt"
    case emptyPassword = "Das Feld Schlüssel ist nicht gefüllt"
    case invalidUserPwdOrName = "Name oder Schlüssel ist ungültig"
    case emptyBirthYear = "Das Feld Geboren ist nicht gefüllt"
    case lifeIsTooLong = "Die Lebensdauer ist zu lang"
    case emptyBookTitle = "Das Feld Titel ist nicht gefüllt"
    case emptyBookAuthor = "Das Feld Author ist nicht gefüllt"
    case emptyWrittenYear = "Das Feld Geschrieben ist nicht gefüllt"
    case emptyQuote = "Der Text eines Zitates ist nicht gefüllt"
    case emptyPage = "Die Seitennummer eines Zitates ist nicht gefüllt"
}

enum StoreResult: String {
    case stored
    case noChangesToStore
    case failed
}
