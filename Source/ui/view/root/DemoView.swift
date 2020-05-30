//
//  DemoView.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

public protocol KK: ObservableObject {
    var title: String { get set }
}

public protocol BooksHaber: ObservableObject {
    var bookListName: String { get set }
}

class DomainObject: KK {
    let id: Int = 0
    @Published var title: String = "DomainObject"
}

class AA: DomainObject, BooksHaber {
    var bookListName: String = "" { willSet { objectWillChange.send() } }
    @Published var hasChanges: Bool = true

    private var disposeBag: Set<AnyCancellable> = []
}

class UU: DomainObject, BooksHaber {
    var bookListName: String = "" { willSet { objectWillChange.send() } }
}

struct Header: View {
    @ObservedObject var konspekt: DomainObject

    var body: some View {
        NavigationView {
            VStack(alignment: .leading) {
                TextField("Konspekt titel: ", text: self.$konspekt.title)
                Text("Konspekt titel: \(self.konspekt.title)")
            }.padding()
        }
    }
}

struct BC<Model>: View where Model: BooksHaber {
    @ObservedObject var bookOwner: Model

    var body: some View {
        NavigationView {
            VStack(alignment: .leading) {
                TextField("Book list name: ", text: self.$bookOwner.bookListName)
                Text("Book list name: \(self.bookOwner.bookListName)")
            }.padding()
        }
    }
}

struct DemoView: View {
    var body: some View {
        VStack {
            Header(konspekt: AA())
            BC(bookOwner: AA())

            Header(konspekt: UU())
            BC(bookOwner: UU())
        }.padding()
    }
}
