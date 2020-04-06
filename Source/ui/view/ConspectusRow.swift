//
//  ConspectusRow.swift
//  Faustus
//
//  Created by Alexander Dittner on 02.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct ConspectusRow: View {
    let selectAction: () -> Void

    class Notifier: ObservableObject {
        @Published var title: String = ""
        @Published var subTitle: String = ""
    }

    @ObservedObject private var conspectus: Conspectus
    @ObservedObject private var notifier = Notifier()

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let textColor: Color
    private let genusColor: Color
    private let iconName: String
    private var disposeBag: Set<AnyCancellable> = []

    init(action: @escaping () -> Void, conspectus: Conspectus) {
        selectAction = action
        self.conspectus = conspectus
        // print("ConspectusRow init with \(conspectus.genus)")

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

            Publishers.CombineLatest(book.$writtenDate, book.$author)
                .map { writtenDate, author in
                    "\(writtenDate), \(author)"
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
    }

    var body: some View {
        return GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                Button("", action: self.selectAction).buttonStyle(RowBgButtonStyle())
                    .frame(width: geometry.size.width, height: 50)

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
                        .opacity(1)
                        .scaleEffect(0.8)
                        .offset(x: geometry.size.width - 30, y: 15)
                }
            }
            .foregroundColor(self.textColor)
        }
    }
}
