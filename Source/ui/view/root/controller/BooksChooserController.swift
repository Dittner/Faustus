//
//  BooksChooserController.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
import Combine

class BooksChooserController: ObservableObject, ChooserController {
    enum ChooserResult {
        case selected(_ result: [Book])
        case canceled
    }

    @Published var selectedBooks: [Book] = []
    @Published var allBooks: [Book] = []
    @Published var filteredBooks: [Book] = []
    @Published var filterText: String = ""
    @Published var result: ChooserResult = .canceled

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

    func show(_ selectedBooks: [Book], bibliography: Bibliography) {
        self.selectedBooks = selectedBooks

        allBooks = bibliography.getValues()
            .filter { $0 is Book && !$0.state.isRemoved }
            .map { $0 as! Book }
            .sorted { $0.content.writtenDate > $1.content.writtenDate }

        print("Books total = \(allBooks.count)")
    }

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = .selected(selectedBooks)
    }
}
