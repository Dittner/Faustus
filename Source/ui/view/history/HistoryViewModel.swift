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
    @Published var userName: String = ""

    private var cancellableSet: Set<AnyCancellable> = []

    init() {
    }


    func createAuthor() {
        model.createAuthor()
    }

    func createBook() {
    }

    func createTag() {
    }
}
