//
//  DocViewHeaders.swift
//  Faustus
//
//  Created by Alexander Dittner on 01.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

struct UserHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var user: User
    @ObservedObject var conspectus: Conspectus
    let onClosedAction: () -> Void

    init(conspectus: Conspectus, onClosed: @escaping () -> Void) {
        self.conspectus = conspectus
        user = conspectus.asUser!
        onClosedAction = onClosed

        print("UserHeader init, user has changes: \(user.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $user.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $user.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)

                Toggle("", isOn: $conspectus.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(conspectus.genus)))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 15)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30, height: 30)
                    .opacity(user.hasChanges ? 1 : 0)

                Spacer()
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}

struct AuthorHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var author: Author
    @ObservedObject var conspectus: Conspectus
    let onClosedAction: () -> Void

    init(conspectus: Conspectus, onClosed: @escaping () -> Void) {
        self.conspectus = conspectus
        author = conspectus.asAuthor!
        onClosedAction = onClosed

        print("AuthorHeader init, author: \(author.id), has changes: \(author.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $author.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $author.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorBirthYear })
                    .saturation(0)

                Toggle("", isOn: $conspectus.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(conspectus.genus)))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 15)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30, height: 30)
                    .opacity(author.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geboren", text: $author.birthYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerAuthorBirthYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorDeathYear })
                    .saturation(0)
                    .frame(width: 100)

                Text("–")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity($author.deathYear.wrappedValue.count == 0 ? 0.25 : 1)

                TextInput(title: "gestorben", text: $author.deathYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerAuthorDeathYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)
                    .frame(width: 100)

                Spacer()

                Spacer().frame(width: 30, height: 30)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}

struct BookHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var book: Book
    @ObservedObject var conspectus: Conspectus
    let onClosedAction: () -> Void

    init(conspectus: Conspectus, onClosed: @escaping () -> Void) {
        self.conspectus = conspectus
        book = conspectus.asBook!
        onClosedAction = onClosed

        print("BookHeader init, book: \(book.id), has changes: \(book.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Titel", text: $book.title, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .center, isFocused: textFocus.id == .headerBookTitle, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerBookWritten  })
                    .saturation(0)

                Toggle("", isOn: $conspectus.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(conspectus.genus)))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 15)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30, height: 30)
                    .opacity(book.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geschrieben", text: $book.writtenDate, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerBookWritten, isSecure: false, format: "-?[0-9]{0,4}", isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerBookAuthor  })
                    .saturation(0)
                    .frame(width: 200)

                Text(", ")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity($book.author.wrappedValue.count == 0 ? 0.25 : 1)

                TextInput(title: "Author", text: $book.author, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerBookAuthor, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.textFocus.id = .headerBookTitle  })
                    .saturation(0)
                    .frame(width: 200)

                Spacer()

                Spacer().frame(width: 30, height: 30)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}
