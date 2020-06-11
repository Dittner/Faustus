//
//  Author.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class AuthorContent: ObservableObject {
    @Published var info: String = "Keine"
    @Published var name: String = ""
    @Published var surname: String = ""
    @Published var birthYear: String = ""
    @Published var deathYear: String = ""
    @Published var initials: String = ""
    @Published var years: String = ""

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

        Publishers.CombineLatest($birthYear, $deathYear)
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { birthYear, deathYear in
                if let birth = Int(birthYear), let death = Int(deathYear), birth < 0 {
                    return deathYear.isEmpty ? "\(abs(birth)) v. Chr." : "\(abs(birth)) – \(abs(death)) v. Chr."
                }
                return deathYear.isEmpty ? birthYear : "\(birthYear) – \(deathYear)"
            }
            .assign(to: \.years, on: self)
            .store(in: &disposeBag)
    }
}

protocol BooksOwner {
    var booksColl: BookColl { get }
}

class Author: Conspectus, BooksOwner, ObservableObject {
    @ObservedObject var content: AuthorContent = AuthorContent()
    @ObservedObject var booksColl: BookColl = BookColl()

    override var genus: ConspectusGenus { return .author }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        booksColl.owner = self

        for prop in [content.$name, content.$surname, content.$birthYear, content.$deathYear, content.$info] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }
    }

    override func getDescription(detailed: Bool = true) -> String {
        return detailed ? "\(content.surname) \(content.name)" : "\(content.surname) \(content.initials)"
    }

    override func getHashName() -> String {
        return "author" + content.name + content.surname + content.birthYear
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok {
            state.validationStatus = conspectusValidation
        } else if content.surname == "" {
            state.validationStatus = .emptyName
        } else if content.birthYear.isEmpty {
            state.validationStatus = .emptyBirthYear
        } else if !content.deathYear.isEmpty, let death = Int(content.deathYear), let birth = Int(content.birthYear), death - birth > 120 {
            state.validationStatus = .lifeIsTooLong
        } else {
            state.validationStatus = .ok
        }
        return state.validationStatus
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["name"] = content.name
        dict["surname"] = content.surname
        dict["birthYear"] = content.birthYear
        dict["deathYear"] = content.deathYear
        dict["info"] = content.info
        dict["books"] = booksColl.books.map { $0.id }
        return dict
    }

    override func deserialize() {
        super.deserialize()
        if let dict = fileData {
            content.name = dict["name"] as? String ?? ""
            content.surname = dict["surname"] as? String ?? ""
            content.birthYear = dict["birthYear"] as? String ?? ""
            content.deathYear = dict["deathYear"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""
        }
    }

    override func deserializeLinkedFiles() {
        super.deserializeLinkedFiles()
        if let dict = fileData {
            if let booksIDs = dict["books"] as? [UID] {
                booksColl.books = booksIDs.map { bibliography.read($0) as? Book }.compactMap { $0 }.sorted { $0 > $1 }
            }
        }

        state.markAsNotChanged()
    }

    override func destroy() {
        super.destroy()
        booksColl.removeAllBooks()
    }
}
