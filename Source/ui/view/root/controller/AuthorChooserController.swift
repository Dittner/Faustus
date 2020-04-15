//
//  AuthorChooserController.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
import Combine

class AuthorChooserController: ObservableObject, ChooserController {
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
        selectedAuthor = nil
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
