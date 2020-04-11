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

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var keyLinesShown: Bool = false
    @Published var isModalViewShow: Bool = false

    let deleteConfirmationController: DeleteConfirmationController = DeleteConfirmationController()
    let booksChooserController: BooksChooserController = BooksChooserController()

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

        Publishers.CombineLatest(deleteConfirmationController.$isModalViewShow, booksChooserController.$isModalViewShow)
            .map { _, _ in
                true
            }
            .assign(to: \.isModalViewShow, on: self)
            .store(in: &disposeBag)
    }

    func confirmDelete() -> AnyPublisher<DeleteResult, Never> {
        deleteConfirmationController.show()

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
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseBooks(selectedBooks: [Book]) -> AnyPublisher<[Book], Never> {
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
    @Published var isModalViewShow: Bool = false
    @Published var result: DeleteResult = .canceled

    func show() {
        isModalViewShow = true
    }

    func cancel() {
        isModalViewShow = false
        result = .canceled
    }

    func apply() {
        isModalViewShow = false
        result = .deleted
    }
}

class BooksChooserController: ObservableObject {
    enum ChooserResult {
        case selected(_ result: [Book])
        case canceled
    }

    @Published var isModalViewShow: Bool = false
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
        isModalViewShow = true
        self.selectedBooks = selectedBooks

        allBooks = bibliography.getValues()
            .filter { $0 is Book && !$0.isRemoved }
            .map { $0 as! Book }
            .sorted { $0.content.writtenDate > $1.content.writtenDate }

        print("Books total = \(allBooks.count)")
    }

    func cancel() {
        isModalViewShow = false
        result = .canceled
    }

    func apply() {
        isModalViewShow = false
        result = .selected(selectedBooks)
    }
}
