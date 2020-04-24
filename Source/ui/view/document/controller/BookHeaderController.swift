//
//  HeaderController.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class BookHeaderController: ViewModel, ChooserController {
    @Published var book: Book!
    @Published var isChoosing: Bool = false
    @Published var allAuthors: [Author] = []
    @Published var filteredAuthors: [Author] = []
    @Published var filterText: String = ""

    @Published var selectedConspectus: Conspectus?

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest($filterText.debounce(for: 0.5, scheduler: RunLoop.main), $allAuthors)
            .map { filterText, authorList in
                filterText.isEmpty ? authorList : authorList.filter { $0.description.hasSubstring(filterText) }
            }
            .sink { authorList in
                self.filteredAuthors = authorList
                print("Filtered list of Author = \(authorList.count)")
            }
            .store(in: &disposeBag)
    }

    func update(_ conspectus: Conspectus) {
        if let b = conspectus as? Book {
            book = b
            isChoosing = false
        }
    }

    var chooseAuthorPublisher: AnyCancellable?
    func chooseAuthor() {
        isChoosing = true

        allAuthors = model.bibliography.getValues()
            .filter { $0 is Author && !$0.state.isRemoved }
            .map { $0 as! Author }
            .sorted { $0.content.surname > $1.content.surname }
    }

    func cancel() {
        isChoosing = false
        selectedConspectus = nil
    }

    func apply() {
        if let author = selectedConspectus as? Author {
            author.booksColl.addBook(book)
        } else if let user = selectedConspectus as? User {
            user.booksColl.addBook(book)
        }

        isChoosing = false
        selectedConspectus = nil
    }
}
