//
//  User.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class UserContent: ObservableObject {
    @Published var info: String = "Keine"
    @Published var name: String = ""
    @Published var surname: String = ""
    @Published var initials: String = ""

    var pwd: String = ""
    fileprivate var encryptedPwd: String = ""
    var isLoggedIn: Bool = false

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        $name
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .removeDuplicates()
            .map { value in
                value.components(separatedBy: " ")
                    .filter { $0 != "" }
                    .map { value in
                        String(value.first!) + "."
                    }
                    .reduce("") { $0 + $1 }
            }
            .assign(to: \.initials, on: self)
            .store(in: &disposeBag)
    }
}

class User: Conspectus, BooksOwner, ObservableObject {
    @ObservedObject var content: UserContent = UserContent()
    @ObservedObject var booksColl: BookColl = BookColl()

    override var genus: ConspectusGenus { return .user }

    private func encryptPwd() -> String {
        return ("Faustus" + content.pwd).sha512()!
    }

    override var description: String {
        return "\(content.name) \(content.surname)"
    }

    override var hashName: String {
        return "user" + content.name + content.surname
    }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        booksColl.owner = self

        for prop in [content.$name, content.$surname] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok { return conspectusValidation }
        if content.name.isEmpty || content.surname.isEmpty { return .emptyName }
        if content.pwd.isEmpty { return .emptyPassword }
        if !content.encryptedPwd.isEmpty && content.encryptedPwd != encryptPwd() { return .invalidUserPwd }
        return .ok
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["name"] = content.name
        dict["surname"] = content.surname
        dict["books"] = booksColl.books.map { $0.id }
        return dict
    }

    override func deserialize(_ bibliography: Bibliography) {
        super.deserialize(bibliography)
        if let dict = fileData {
            content.name = dict["name"] as? String ?? ""
            content.surname = dict["surname"] as? String ?? ""
            content.encryptedPwd = dict["encryptedPwd"] as? String ?? ""
            if let booksID = dict["books"] as? [UID] {
                booksColl.books = booksID.map { bibliography.read($0) as? Book }.compactMap { $0 }
            }
        }

        state.markAsNotChanged()
    }

    override func didDestroy(_ conspectus: Conspectus) {
        super.didDestroy(conspectus)
        if let book = conspectus as? Book {
            booksColl.removeBook(book)
        }
    }
}
