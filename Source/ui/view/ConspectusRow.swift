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
    let rowHeight:CGFloat

    class Notifier: ObservableObject {
        @Published var title: String = ""
        @Published var subTitle: String = ""
        @Published var isSelected: Bool = false
        @Published var hasLinks: Bool = false
    }

    @ObservedObject private var state: ConspectusState
    @ObservedObject private var notifier = Notifier()

    var textColor: Color

    private let isSelectable: Bool
    private let genusColor: Color
    private let iconName: String
    private var disposeBag: Set<AnyCancellable> = []

    init(action: @escaping (ConspectusRowAction) -> Void, conspectus: Conspectus, selectable: Bool = false, selected: Bool = false, textColor: Color = Color.F.gray, selectedTextColor: Color = Color.F.white) {
        self.action = action
        state = conspectus.state
        isSelectable = selectable
        self.textColor = textColor

        iconName = conspectus.genus.toIconName()

        if let author = conspectus as? Author {
            rowHeight = 50
            genusColor = Color.F.author
            Publishers.CombineLatest(author.content.$surname, author.content.$initials)
                .map { surname, initials in
                    "\(surname) \(initials)"
                }
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)

            author.content.$years
                .assign(to: \.subTitle, on: notifier)
                .store(in: &disposeBag)

        } else if let user = conspectus as? User {
            rowHeight = 50
            genusColor = Color.F.black
            Publishers.CombineLatest(user.content.$surname, user.content.$initials)
                .map { surname, initials in
                    "\(surname) \(initials)"
                }
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else if let book = conspectus as? Book {
            rowHeight = 50
            genusColor = Color.F.book

            book.content.$title
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)

            Publishers.CombineLatest3(book.content.$writtenDate, book.content.$author, book.content.$authorText)
                .map { writtenDate, author, authorText in
                    var a: String = ""
                    var b: String = ""
                    if let user = author as? User {
                        a = writtenDate
                        b = "\(user.content.surname) \(user.content.initials)"
                    } else if let author = author as? Author {
                        a = writtenDate
                        b = "\(author.content.surname) \(author.content.initials)"
                    } else {
                        a = writtenDate
                        b = "\(authorText)"
                    }

                    return b.isEmpty ? a : a + ", " + b
                }
                .assign(to: \.subTitle, on: notifier)
                .store(in: &disposeBag)

            book.content.$author
                .map { value in
                    value is User || value is Author
                }
                .assign(to: \.hasLinks, on: notifier)
                .store(in: &disposeBag)
        } else if let tag = conspectus as? Tag {
            rowHeight = 50
            genusColor = Color.F.tag

            tag.content.$name
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else if let quote = conspectus as? Quote {
            rowHeight = 100
            genusColor = Color.F.gray
            
            Publishers.CombineLatest3(quote.book.content.$title, quote.$startPage, quote.$endPage)
            .map { title, startPage, endPage in
                let res:String = title.isEmpty ? "" : title + ", "
                if startPage.isEmpty {
                    return res
                } else if endPage.isEmpty {
                    return res + "s." + startPage
                } else {
                    return res + "ss." + startPage + "–" + endPage
                }
            }
            .assign(to: \.title, on: notifier)
            .store(in: &disposeBag)

            quote.$text
                .assign(to: \.subTitle, on: notifier)
                .store(in: &disposeBag)

        } else {
            rowHeight = 50
            genusColor = Color.F.gray
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
                        .toggleStyle(RowBgToggleStyle(selectionColor: self.genusColor))
                        .frame(width: geometry.size.width, height: self.rowHeight)
                } else {
                    Button("", action: { self.action(.tapped) }).buttonStyle(RowBgButtonStyle())
                        .frame(width: geometry.size.width, height: self.rowHeight)
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
                    .opacity(0.6)
                    .scaleEffect(0.8)
                    .offset(x: 0, y: 0)

                Text(self.notifier.title)
                    .allowsHitTesting(false)
                    .lineLimit(1)
                    .multilineTextAlignment(.center)
                    .font(Font.custom(.pragmatica, size: 16))
                    .frame(minWidth: 100, idealWidth: 500, maxWidth: .infinity, minHeight: 30, idealHeight: 50, maxHeight: 50, alignment: .topLeading)
                    .offset(x: 50, y: self.notifier.subTitle.isEmpty ? 15 : 8)
                    .frame(width: geometry.size.width - 50, height: 50)

                Text("\(self.notifier.subTitle)")
                    .allowsHitTesting(false)
                    .font(Font.custom(self.notifier.hasLinks ? .pragmaticaExtraLightItalics : .pragmaticaExtraLight, size: 14))
                    .lineLimit(4)
                    .offset(x: 50, y: 28)
                    .frame(width: geometry.size.width - 50, alignment: .leading)

                if self.state.isRemoved {
                    Image("remove")
                        .renderingMode(.template)
                        .allowsHitTesting(false)
                        .scaleEffect(0.8)
                        .offset(x: geometry.size.width - 20, y: 15)
                } else if self.notifier.isSelected {
                    Image("check")
                        .renderingMode(.template)
                        .allowsHitTesting(false)
                        .scaleEffect(1)
                        .offset(x: geometry.size.width - 20, y: 15)
                }

                Separator(color: self.textColor.opacity(0.1), width: .infinity).offset(y: self.rowHeight - 1)
            }
            .foregroundColor(self.textColor)
        }.frame(height: rowHeight)
    }
}

struct RowBgButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        Color(configuration.isPressed ? NSColor.F.black01 : NSColor.F.clear)
    }
}

struct RowBgToggleStyle: ToggleStyle {
    let selectionColor: Color
    func makeBody(configuration: Self.Configuration) -> some View {
        HStack(alignment: .center, spacing: 0) {
            if configuration.isOn {
                selectionColor.frame(width: 4)
            }

            Color.F.clear
                .onTapGesture {
                    withAnimation {
                        configuration.$isOn.wrappedValue.toggle()
                    }
                }
        }
    }
}
