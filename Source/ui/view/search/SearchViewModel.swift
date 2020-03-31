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
    @Published var isFilterTextFocused: Bool = true
    @Published var authors: [Conspectus] = []

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        model.$state
            .dropFirst()
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .removeDuplicates()
            .map { $0 != .docEditing }
            .removeDuplicates()
            .sink { value in
                self.isFilterTextFocused = value
                print("isFilterTextFocused = \(value)")
            }
            .store(in: &disposeBag)

        authors = model.authors.getValues()
        model.authors.objectWillChange
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { value in
                value.sorted {
                    $0.id > $1.id
                }
            }
            .assign(to: \.authors, on: self)
            .store(in: &disposeBag)
    }
    
    func select(conspectus: Conspectus)  {
        model.select(conspectus)
    }
}
