//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

final class HistoryViewModel: ViewModel {
    @Published var stack: [Conspectus] = []

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "HistoryViewModel init")
        model.$recentOpened
            .assign(to: \.stack, on: self)
            .store(in: &disposeBag)
    }

    func createAuthor() {
        model.createAuthor()
    }

    func createBook() {
        model.createBook()
    }

    func createTag() {
    }

    func select(conspectus: Conspectus) {
        model.select(conspectus)
    }
}
