//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum SearchFilter {
    case authors
    case books
    case tags
    case quotes
}

final class SearchViewModel: ViewModel {
    @Published var selectedFilter: SearchFilter = .authors
    @Published var filterText: String = ""
    @Published var result: [Conspectus] = []

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "SearchViewModel init")

        Publishers.CombineLatest($selectedFilter, $filterText)
            //.debounce(for: 0.2, scheduler: RunLoop.main)
            .flatMap { filter, filterText -> CurrentValueSubject<[Conspectus], Never> in
                print("filter: \(filter), filterText = \(filterText)")
                switch filter {
                case .authors: return self.model.authors.objectWillChange
                case .books: return self.model.books.objectWillChange
                case .tags: return self.model.tags.objectWillChange
                default: return self.model.authors.objectWillChange
                }
            }
            .map { value in
                value.sorted {
                    if let a1 = $0.asAuthor, let a2 = $1.asAuthor {
                        return a1.birthYear > a2.birthYear
                    } else if let b1 = $0.asBook, let b2 = $1.asBook {
                        return b1.writtenDate > b2.writtenDate
                    } else {
                        return $0.id > $1.id
                    }
                }
            }
            .assign(to: \.result, on: self)
            .store(in: &disposeBag)
    }

    func select(conspectus: Conspectus) {
        model.select(conspectus)
    }
}
