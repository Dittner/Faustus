//
//  BookListController.swift
//  Faustus
//
//  Created by Alexander Dittner on 08.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class BookListController: ViewModel, ChooserController {
    @Published var bookColl: BookColl!

    @Published var isChoosing: Bool = false
    @Published var selectedBooks: [Book] = []
    @Published var allBooks: [Book] = []
    @Published var filteredBooks: [Book] = []
    @Published var filterText: String = ""
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest($filterText.debounce(for: 0.5, scheduler: RunLoop.main), $allBooks)
            .map { filterText, bookList in
                filterText.isEmpty ? bookList : bookList.filter { $0.description.hasSubstring(filterText) }
            }
            .sink { bookList in
                self.filteredBooks = bookList
                print("Filtered list of Book = \(bookList.count)")
            }
            .store(in: &disposeBag)
    }

    func update(_ conspectus: Conspectus) {
        if let booksOwner = conspectus as? BooksOwner {
            bookColl = booksOwner.booksColl
        }
    }

    var chooseBooksPublisher: AnyCancellable?
    func chooseBooks() {
        if !isChoosing {
            isChoosing = true
            selectedBooks = bookColl.books

            allBooks = model.bibliography.getValues()
                .filter { $0 is Book && !$0.state.isRemoved }
                .map { $0 as! Book }
                .sorted { $0.content.writtenDate > $1.content.writtenDate }

            print("Books total = \(allBooks.count)")
        }
    }

    func removeBook(_ book: Book) {
        bookColl.removeBook(book)
    }

    func cancel() {
        isChoosing = false
    }

    func apply() {
        isChoosing = false
        bookColl.updateBooks(selectedBooks)
    }
}
