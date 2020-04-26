//
//  DocView+Chooser.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct BooksChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var controller: BookListController

    func select(b: Book) {
        controller.selectedBooks.append(b)
    }

    func deselect(b: Book) {
        controller.selectedBooks.removeAll { $0.id == b.id }
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.black)
                    .frame(width: 50)

                TextInput(title: "", text: $controller.filterText, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: textFocus.id == .modalBookChooserSearch, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.light)
                    .onAppear {
                        self.textFocus.id = .modalBookChooserSearch
                    }
            }

            Separator(color: Color.F.black, width: .infinity).padding(.horizontal, 15)

            if controller.filteredBooks.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(controller.filteredBooks, id: \.id) { book in
                            ConspectusRow(action: { event in
                                if event == .selected {
                                    self.select(b: book)
                                } else {
                                    self.deselect(b: book)
                                }

                            }, conspectus: book, selectable: true, selected: self.controller.selectedBooks.contains(book), textColor: Color.F.black)
                        }
                    }
                }
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(width: 700, height: 400)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct AuthorChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var controller: BookHeaderController

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.black)
                    .frame(width: 50)

                TextInput(title: "", text: $controller.filterText, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: textFocus.id == .authorChooserSearch, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.light)
                    .onAppear {
                        self.textFocus.id = .authorChooserSearch
                    }
            }

            Separator(color: Color.F.black, width: .infinity).padding(.horizontal, 15)

            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 1) {
                    ConspectusRow(action: { event in
                        if event == .selected {
                            self.controller.selectedConspectus = self.controller.model.user
                        }

                    }, conspectus: self.controller.model.user, selectable: true, selected: self.controller.selectedConspectus == self.controller.model.user, textColor: Color.F.black)

                    ForEach(controller.filteredAuthors, id: \.id) { author in
                        ConspectusRow(action: { event in
                            if event == .selected {
                                self.controller.selectedConspectus = author
                            }

                        }, conspectus: author, selectable: true, selected: self.controller.selectedConspectus == author, textColor: Color.F.black)
                    }
                }
            }

            ModalViewFooter(controller: controller)
        }
        .frame(height: 400)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct ParentTagChooser: View {
    @ObservedObject var controller: TagHeaderController
    @ObservedObject var state: ConspectusState
    @ObservedObject var owner: Tag

    init(controller: TagHeaderController) {
        self.controller = controller
        state = controller.owner.state
        owner = controller.owner
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if controller.tags.count > 0 {
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(controller.tags, id: \.id) { tag in
                            TagTreeNodeLink(tag, isSelected: self.controller.selectedParentTag == tag, action: {
                                self.controller.selectedParentTag = self.controller.selectedParentTag == tag ? nil : tag
                            })
                        }
                    }.padding(.horizontal, 10)
                        .padding(.vertical, 10)
                        .frame(width: 970, alignment: .topLeading)
                }.frame(width: 970, height: 350, alignment: .topLeading)
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(height: 400)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct TagsChooser: View {
    @ObservedObject var controller: TagTreeController

    init(controller: TagTreeController) {
        self.controller = controller
        print("TagsChooser init")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if controller.allTags.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(controller.allTags, id: \.id) { tag in
                            TagTreeNodeLink(tag, isSelected: self.controller.selectedTags.contains(tag), action: {
                                self.controller.selectDeselect(tag)
                            })
                        }
                    }.padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .frame(width: 770, alignment: .topLeading)
                }.frame(width: 770, height: 350, alignment: .topLeading)
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(width: 800, height: 400)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct LinkChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var chooser: QuoteLinkChooser

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.black)
                    .frame(width: 50)

                TextInput(title: "", text: $chooser.filterText, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: false, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(width: 250, height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.light)

                FilterTabBar(selectedFilter: $chooser.selectedFilter, iconColor: Color.F.dark, bgColor: Color.F.whiteBG, selectedIconColor: Color.F.whiteBG, selectBgColor: Color.F.dark, enabledFilters: [.authors, .books, .tags, .comments])
                    .cornerRadius(2)

                SelectableText(text: "Kommentieren", color: Color.F.black)
                    .font(Font.custom(.mono, size: 16))
                    .padding(.trailing, 15)
                    .padding(.top, 0)
                    .onTapGesture {
                        self.chooser.choosingMode = .commenting
                    }
                    .frame(width: 300, alignment: .trailing)
                    .opacity(self.chooser.choosingMode == .choosingUserBooksComments ? 1 : 0)
            }

            Separator(color: Color.F.black, width: .infinity).padding(.horizontal, 15)

            if self.chooser.choosingMode == .commenting {
                HStack(alignment: .top, spacing: 0) {
                    Text("S.")
                        .font(Font.custom(.pragmaticaBold, size: 21))
                        .foregroundColor(Color.F.black)

                    EditableText("", text: $chooser.userCommentStartPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .right, isEditing: true, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: 70)

                    Text("–")
                        .font(Font.custom(.pragmaticaBold, size: 21))
                        .foregroundColor(Color.F.black)
                        .opacity(chooser.userCommentEndPage.count == 0 ? 0 : 1)

                    EditableText("", text: $chooser.userCommentEndPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .left, isEditing: true, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: 70)

                    Spacer()

                    Button("", action: self.chooser.cancelCommenting)
                        .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 25))
                }.padding(.horizontal, 15)
                    .frame(height: 40)
            }

            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 1) {
                    if self.chooser.choosingMode == .commenting {
                        TextArea(text: $chooser.userCommentText, textColor: NSColor.F.black, font: QuoteCell.textFont, isEditable: true)
                            .lineSpacing(5)
                            .colorScheme(.light)
                            .frame(width: 780, height: TextArea.textHeightFrom(text: chooser.userCommentText, width: 780, font: QuoteCell.textFont, isShown: true, minHeight: 200))
                            .padding(.vertical, 5)
                            .padding(.leading, 10)
                            .padding(.trailing, 10)
                            .saturation(0)

                    } else if self.chooser.choosingMode == .choosingUserBooksComments {
                        ForEach(chooser.selectedUserBookComments, id: \.id) { comment in
                            ConspectusRow(action: { event in
                                if event == .selected {
                                    self.chooser.selectedLink = comment
                                }

                            }, conspectus: comment, selectable: true, selected: self.chooser.selectedLink == comment, textColor: Color.F.black)
                        }
                    } else if chooser.selectedFilter == .comments {
                        ForEach(chooser.userBooks, id: \.id) { userBook in
                            ConspectusRow(action: { event in
                                if event == .selected {
                                    self.chooser.selectedUserBook = userBook
                                    self.chooser.choosingMode = .choosingUserBooksComments
                                }

                            }, conspectus: userBook, selectable: true, selected: self.chooser.selectedUserBook == userBook, textColor: Color.F.black)
                        }
                    } else if chooser.searchResult.count > 0 {
                        ForEach(chooser.searchResult, id: \.id) { link in
                            ConspectusRow(action: { event in
                                if event == .selected {
                                    self.chooser.selectedLink = link
                                }

                            }, conspectus: link, selectable: true, selected: self.chooser.selectedLink == link, textColor: Color.F.black)
                        }
                    } else {
                        Spacer()
                    }
                }.colorScheme(.light)
            }
            .colorScheme(.dark)

            ModalViewFooter(controller: chooser)
        }
        .frame(width: 800, height: 400)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct ModalViewFooter: View {
    enum ModalViewResult {
        case apply
        case cancel
    }

    let controller: ChooserController

    @EnvironmentObject var modalViewObservable: ModalViewObservable
    var body: some View {
        HStack(alignment: .bottom, spacing: 0) {
            Button("", action: {
                self.modalViewObservable.isShown = false
                self.controller.cancel()
            }).buttonStyle(RedButtonStyle())
                .frame(width: 50, height: 50)

            Spacer()

            Button("", action: {
                self.modalViewObservable.isShown = false
                self.controller.apply()
            }).buttonStyle(GreenButtonStyle())
                .frame(width: 50, height: 50)

        }.onAppear { self.modalViewObservable.isShown = true }
    }
}

struct TagTreeNodeLink: View {
    @ObservedObject var tag: Tag
    @ObservedObject var state: ConspectusState
    let isSelected: Bool
    let levelOffset: CGFloat
    let levelWidth: Int = 40
    let height: CGFloat = 25
    let onTapAction: (() -> Void)?
    let textColor: Color
    let font: Font

    init(_ tag: Tag, isSelected: Bool, action: (() -> Void)?) {
        self.tag = tag
        state = tag.state

        self.isSelected = isSelected
        textColor = tag.state.isRemoved ? Color.F.red : Color.F.black
        font = Font.custom(.pragmatica, size: 16)
        levelOffset = CGFloat(tag.content.getLevel() * levelWidth)
        onTapAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            Spacer().frame(width: levelOffset)

            Text(tag.content.name)
                .lineLimit(1)
                .frame(height: height)
                .font(font)
                .foregroundColor(textColor)
                .padding(.horizontal, 5)
                .background(self.isSelected ? Color.F.tag : Color.F.clear)
                .onTapGesture {
                    self.onTapAction?()
                }
        }
    }
}

struct TreeNodeLines: Shape {
    let levelWidth: Int
    func path(in rect: CGRect) -> Path {
        var path = Path()
        if rect.width > 0 {
            let linesAmount = Int(rect.width) / levelWidth

            for i in 0 ... linesAmount - 1 {
                path.move(to: CGPoint(x: i * levelWidth + levelWidth / 2, y: 0))
                path.addLine(to: CGPoint(x: i * levelWidth + levelWidth / 2, y: Int(rect.height)))
            }

            path.move(to: CGPoint(x: Int(rect.width - CGFloat(levelWidth / 2)), y: Int(rect.height / 2)))
            path.addLine(to: CGPoint(x: Int(rect.width - 2), y: Int(rect.height / 2)))
        }

        return path
    }
}
