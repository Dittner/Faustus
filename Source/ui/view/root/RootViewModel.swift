//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum AppScreen: String {
    case login
    case docList
}

enum ModalViewCategory: String {
    case no
    case deleteConfirmation
    case booksChooser
    case authorChooser
}

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var keyLinesShown: Bool = false
    @Published var modalView: ModalViewCategory = .no

    var deleteConfirmationController: DeleteConfirmationController = DeleteConfirmationController()
    var booksChooserController: BooksChooserController = BooksChooserController()
    var authorChooserController: AuthorChooserController = AuthorChooserController()

    static var shared: RootViewModel?
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        RootViewModel.shared = self
        model.$state
            .removeDuplicates()
            .map { value in
                value == .auth ? .login : .docList
            }
            .assign(to: \.screen, on: self)
            .store(in: &disposeBag)
    }

    func confirmDelete() -> AnyPublisher<DeleteResult, Never> {
        modalView = .deleteConfirmation

        let p = Future<DeleteResult, Never> { promise in
            self.deleteConfirmationController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case .deleted:
                        promise(.success(result))
                    case .canceled:
                        promise(.success(result))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseBooks(selectedBooks: [Book]) -> AnyPublisher<[Book], Never> {
        modalView = .booksChooser
        booksChooserController.show(selectedBooks, bibliography: model.bibliography)

        let p = Future<[Book], Never> { promise in
            self.booksChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))

                    case .canceled:
                        promise(.success(selectedBooks))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseAuthor() -> AnyPublisher<Author?, Never> {
        modalView = .authorChooser
        authorChooserController.show(model.bibliography)

        let p = Future<Author?, Never> { promise in
            self.authorChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))

                    case .canceled:
                        promise(.success(nil))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }
}

enum DeleteResult {
    case deleted
    case canceled
}

class DeleteConfirmationController: ObservableObject {
    @Published var result: DeleteResult = .canceled

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = .deleted
    }
}

class BooksChooserController: ObservableObject {
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

class AuthorChooserController: ObservableObject {
    enum ChooserResult {
        case selected(_ result: Author)
        case canceled
    }

    @Published var selectedAuthor: Author?
    @Published var allAuthors: [Author] = []
    @Published var filteredAuthors: [Author] = []
    @Published var filterText: String = ""
    @Published var result: ChooserResult = .canceled

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

    func show(_ bibliography: Bibliography) {
        allAuthors = bibliography.getValues()
            .filter { $0 is Author && !$0.state.isRemoved }
            .map { $0 as! Author }
            .sorted { $0.content.surname > $1.content.surname }

        print("Authors total = \(allAuthors.count)")
    }

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = selectedAuthor != nil ? .selected(selectedAuthor!) : .canceled
    }
}
