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
        genusColor = Color(conspectus.genus)

        iconName = conspectus.genus.toIconName()

        if let author = conspectus as? Author {
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
            Publishers.CombineLatest(user.content.$surname, user.content.$initials)
                .map { surname, initials in
                    "\(surname) \(initials)"
                }
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else if let book = conspectus as? Book {
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
            tag.content.$name
                .assign(to: \.title, on: notifier)
                .store(in: &disposeBag)
        } else if let quote = conspectus as? Quote {
            Publishers.CombineLatest3(quote.book.content.$title, quote.$startPage, quote.$endPage)
                .map { title, startPage, endPage in
                    let res: String = title.isEmpty ? "" : title + ", "
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
        }

        notifier.isSelected = selected
        notifier.$isSelected
            .dropFirst()
            .sink { value in
                if selectable {
                    action(value ? .selected : .deselected)
                } else {
                    action(.tapped)
                }
            }
            .store(in: &disposeBag)
    }

    var body: some View {
        Button(action: { self.action(.tapped) }) {
            HStack(alignment: .center, spacing: 0) {
                Rectangle()
                    .foregroundColor(self.genusColor)
                    .allowsHitTesting(false)
                    .frame(width: 3, height: 50)
                    .opacity(isSelectable && notifier.isSelected ? 1 : 0)
                    .padding(.top, -2)

                Image(self.iconName)
                    .renderingMode(.template)
                    .foregroundColor(self.textColor)
                    .allowsHitTesting(false)
                    .frame(width: 46)
                    .opacity(0.6)
                    .scaleEffect(0.8)
                    .offset(y: -2)

                VStack(alignment: .center, spacing: 0) {
                    Spacer()
                        .allowsHitTesting(false)
                        .frame(width: 20, height: 1)
                        .padding(.bottom, self.notifier.subTitle.isEmpty ? 13 : 8)

                    Text(self.notifier.title)
                        .allowsHitTesting(false)
                        .lineLimit(1)
                        .layoutPriority(1)
                        .font(Font.custom(.pragmatica, size: 16))
                        .frame(maxWidth: .infinity, alignment: .leading)

                    if !self.notifier.subTitle.isEmpty {
                        Text("\(self.notifier.subTitle)")
                            .allowsHitTesting(false)
                            .font(Font.custom(self.notifier.hasLinks ? .pragmaticaExtraLightItalics : .pragmaticaExtraLight, size: 14))
                            .lineLimit(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, 8)

                    } else {
                        Spacer()
                    }

                    Separator(color: self.textColor.opacity(0.1), width: .infinity)
                        .padding(.horizontal, -50)

                }.foregroundColor(self.textColor)

                Image("remove")
                    .renderingMode(.template)
                    .foregroundColor(self.textColor)
                    .allowsHitTesting(false)
                    .scaleEffect(0.8)
                    .frame(width: 25)
                    .opacity(self.state.isRemoved ? 1 : 0)

                Image("check")
                    .renderingMode(.template)
                    .foregroundColor(self.textColor)
                    .allowsHitTesting(false)
                    .frame(width: 20)
                    .opacity(self.notifier.isSelected ? 1 : 0)

            }.padding(.trailing, 0)

        }.buttonStyle(RowBgButtonStyle(isSelectable: isSelectable, isOn: $notifier.isSelected))
    }
}

struct RowBgButtonStyle: ButtonStyle {
    var isSelectable: Bool
    var isOn: Binding<Bool>

    func makeBody(configuration: Self.Configuration) -> some View {
        configuration.label
            .background(Color(configuration.isPressed && !isSelectable ? NSColor.F.black01 : NSColor.F.clear))
            .onTapGesture {
                withAnimation {
                    if self.isSelectable {
                        self.isOn.wrappedValue.toggle()
                    } else {
                        self.isOn.wrappedValue = false
                    }
                }
            }
    }
}
