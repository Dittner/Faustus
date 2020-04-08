//
//  ConspectusRow.swift
//  Faustus
//
//  Created by Alexander Dittner on 02.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum ConspectusRowAction {
    case tapped
    case selected
    case deselected
}

struct ConspectusRow: View {
    let action: (ConspectusRowAction) -> Void

    class Notifier: ObservableObject {
        @Published var title: String = ""
        @Published var subTitle: String = ""
        @Published var isSelected: Bool = false
    }

    @ObservedObject private var conspectus: Conspectus
    @ObservedObject private var notifier = Notifier()
    private let isSelectable: Bool

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let textColor: Color
    private let genusColor: Color
    private let iconName: String
    private var disposeBag: Set<AnyCancellable> = []

    init(action: @escaping (ConspectusRowAction) -> Void, conspectus: Conspectus, selectable: Bool = false, selected: Bool = false) {
        self.action = action
        self.conspectus = conspectus
        isSelectable = selectable

        //print("ConspectusRow init with \(conspectus.genus)")

        if let author = conspectus.asAuthor {
            textColor = Color.F.gray
            genusColor = Color.F.author
            iconName = "author"
            Publishers.CombineLatest(author.$surname, author.$initials)
                .map { surname, initials in
                    "\(surname) \(initials)"
                }
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)

            author.$years
                .assign(to: \.subTitle, on: notifier)
                .store(in: &disposeBag)
        } else if let user = conspectus.asUser {
            textColor = Color.F.gray
            genusColor = Color.F.white
            iconName = "user"
            Publishers.CombineLatest(user.$surname, user.$initials)
                .map { surname, initials in
                    "\(surname) \(initials)"
                }
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else if let book = conspectus.asBook {
            textColor = Color.F.gray
            genusColor = Color.F.book
            iconName = "book"

            book.$title
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)

            Publishers.CombineLatest(book.$writtenDate, book.$authorText)
                .map { writtenDate, authorText in
                    "\(writtenDate), \(authorText)"
                }
                .assign(to: \.subTitle, on: notifier)
                .store(in: &disposeBag)
        } else if let tag = conspectus.asTag {
            textColor = Color.F.gray
            genusColor = Color.F.tag
            iconName = "tag"

            tag.$name
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else {
            textColor = Color.F.gray
            genusColor = Color.F.gray
            iconName = "quote"
        }

        if selectable {
            notifier.isSelected = selected
            notifier.$isSelected
                .dropFirst()
                .sink { value in
                    action(value ? .selected : .deselected)
                }
                .store(in: &disposeBag)
        }
    }

    var body: some View {
        return GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                if self.isSelectable {
                    Toggle("", isOn: self.$notifier.isSelected)
                        .toggleStyle(RowBgToggleStyle())
                        .frame(width: geometry.size.width, height: 50)
                } else {
                    Button("", action: { self.action(.tapped) }).buttonStyle(RowBgButtonStyle())
                        .frame(width: geometry.size.width, height: 50)
                }

                Rectangle()
                    .foregroundColor(self.genusColor)
                    .allowsHitTesting(false)
                    .frame(width: 20, height: 2)
                    .offset(x: geometry.size.width / 2 - 10, y: 0)

                Image(self.iconName)
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .frame(width: 50, height: 50)
                    .opacity(0.4)
                    .scaleEffect(0.8)
                    .offset(x: 0, y: 0)

                Text(self.notifier.title)
                    .allowsHitTesting(false)
                    .lineLimit(1)
                    .font(Font.custom(.pragmatica, size: 16))
                    .frame(minWidth: 100, idealWidth: 500, maxWidth: .infinity, minHeight: 30, idealHeight: 50, maxHeight: 50, alignment: .topLeading)
                    .offset(x: 50, y: self.notifier.subTitle.isEmpty ? 15 : 8)
                    .frame(width: geometry.size.width - 50, height: 50)

                Text("\(self.notifier.subTitle)")
                    .allowsHitTesting(false)
                    .lineLimit(1)
                    .font(Font.custom(.pragmaticaExtraLight, size: 12))
                    .frame(minWidth: 100, idealWidth: 500, maxWidth: .infinity, minHeight: 30, idealHeight: 50, maxHeight: 50, alignment: .topLeading)
                    .offset(x: 50, y: 28)
                    .frame(width: geometry.size.width - 50, height: 50)

                if self.conspectus.isRemoved {
                    Image("remove")
                        .renderingMode(.template)
                        .allowsHitTesting(false)
                        .scaleEffect(0.8)
                        .offset(x: geometry.size.width - 30, y: 15)
                } else if self.notifier.isSelected {
                    Image("check")
                        .renderingMode(.template)
                        .allowsHitTesting(false)
                        .scaleEffect(1)
                        .offset(x: geometry.size.width - 30, y: 15)
                }
            }
            .foregroundColor(self.textColor)
        }
    }
}
