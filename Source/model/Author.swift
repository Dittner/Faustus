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
    @Published var books: [Book] = []

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
            .map { birth, death in
                death.count > 0 ? birth + "–" + death : birth
            }
            .assign(to: \.years, on: self)
            .store(in: &disposeBag)
    }
}

class Author: Conspectus {
    @ObservedObject var content: AuthorContent = AuthorContent()

    override var genus: ConspectusGenus { return .author }

    override var description: String {
        return "\(content.name) \(content.surname) \(content.birthYear)"
    }

    override var hashName: String {
        return "author" + content.name + content.surname + content.birthYear
    }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        for prop in [content.$name, content.$surname, content.$birthYear, content.$deathYear, content.$info] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }

        content.$books
            .map { _ in
                true
            }
            .assign(to: \.hasChanges, on: self)
            .store(in: &disposeBag)
    }

    override func validate() -> ValidationStatus {
        if content.surname == "" {
            return .emptyName
        } else if content.birthYear == "" {
            return .emptyBirthYear
        } else if content.deathYear != "", let death = Int(content.deathYear), let birth = Int(content.birthYear), death - birth > 120 {
            return .lifeIsTooLong
        } else {
            return .ok
        }
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["name"] = content.name
        dict["surname"] = content.surname
        dict["birthYear"] = content.birthYear
        dict["deathYear"] = content.deathYear
        dict["info"] = content.info
        dict["books"] = content.books.map { $0.id }
        return dict
    }

    override func deserialize(_ bibliography: Bibliography) {
        super.deserialize(bibliography)
        if let dict = fileData {
            content.name = dict["name"] as? String ?? ""
            content.surname = dict["surname"] as? String ?? ""
            content.birthYear = dict["birthYear"] as? String ?? ""
            content.deathYear = dict["deathYear"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""
            if let booksID = dict["books"] as? [UID] {
                content.books = booksID.map { bibliography.read($0) as? Book }.compactMap { $0 }
            }
        }

        hasChanges = false
    }

    override func removeLinks(with conspectus: Conspectus) {}
    
    func updateBooks(_ coll:[Book]) {
        for b in coll {
            if !content.books.contains(b) {
            }
        }
    }
}
