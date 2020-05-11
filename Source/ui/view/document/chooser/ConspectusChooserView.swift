//
//  DocView+Chooser.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct ConspectusChooserView: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            if chooser.selectedFilter != .tags || chooser.showFilterBar {
                ChooserHeader(chooser: chooser).frame(width: 800)
                Separator(color: Color.F.black, width: .infinity).padding(.horizontal, 15)
            }
            

            if self.chooser.selectedFilter == .comments && self.chooser.mode == .commenting {
                UserCommentForm(chooser: chooser)
            }

            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 1) {
                    if self.chooser.selectedFilter == .authors {
                        AuthorChooserSubView(chooser: chooser)
                    } else if self.chooser.selectedFilter == .books {
                        BooksChooserSubView(chooser: chooser)
                    } else if self.chooser.selectedFilter == .tags {
                        TagsChooserSubView(chooser: chooser)
                    } else if self.chooser.selectedFilter == .comments {
                        UserCommentsChooserSubView(chooser: chooser)
                    }
                }
            }
            .colorScheme(.dark)

            ChooserFooter(controller: chooser)
        }
        .frame(width: 800, height: 330)
        .background(Color.F.grayBG)
        .cornerRadius(10)
        .shadow(color: Color.F.black025, radius: 1, x: 0, y: 1)
    }
}

struct ChooserHeader: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
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
            
            if chooser.showFilterBar {
                FilterTabBar(selectedFilter: $chooser.selectedFilter, iconColor: Color.F.dark, bgColor: Color.F.whiteBG, selectedIconColor: Color.F.whiteBG, selectBgColor: Color.F.dark, enabledFilters: [.authors, .books, .tags, .comments])
                    .cornerRadius(2)
            } else {
                Spacer()
            }
            

            SelectableText(text: "Kommentieren", color: Color.F.black)
                .font(Font.custom(.mono, size: 16))
                .padding(.trailing, 15)
                .padding(.top, 0)
                .onTapGesture {
                    self.chooser.mode = .commenting
                }
                .frame(width: 300, alignment: .trailing)
                .opacity(self.chooser.mode == .chooseLinkAmongUserBooksComment ? 1 : 0)
        }
    }
}

struct UserCommentForm: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
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
}

struct AuthorChooserSubView: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            ConspectusRow(action: { event in
                if event == .selected {
                    self.chooser.selectedAuthor = self.chooser.model.user
                }

            }, conspectus: self.chooser.model.user, selectable: true, selected: self.chooser.selectedAuthor == self.chooser.model.user, textColor: Color.F.black)

            ForEach(chooser.searchResult, id: \.id) { author in
                ConspectusRow(action: { event in
                    if event == .selected {
                        self.chooser.selectedAuthor = author
                    }

                }, conspectus: author, selectable: true, selected: self.chooser.selectedAuthor == author, textColor: Color.F.black)
            }
        }
    }
}

struct BooksChooserSubView: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
        ForEach(chooser.searchResult, id: \.id) { book in
            ConspectusRow(action: { event in
                if event == .selected {
                    self.chooser.selectedBooks.append(book as! Book)
                } else {
                    self.chooser.selectedBooks.removeAll { $0.id == book.id }
                }

            }, conspectus: book, selectable: true, selected: self.chooser.selectedBooks.contains(book as! Book), textColor: Color.F.black)
        }
    }
}

struct TagsChooserSubView: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            if chooser.selectOnlyParentTag {
                ForEach(chooser.filteredTags, id: \.id) { tag in
                    TagTreeNodeLink(tag, isSelected: self.chooser.selectedParentTag == tag, action: {
                        self.chooser.selectedParentTag = self.chooser.selectedParentTag == tag ? nil : tag
                    })
                }
            } else {
                ForEach(chooser.allTags, id: \.id) { tag in
                    TagTreeNodeLink(tag, isSelected: self.chooser.selectedTags.contains(tag), action: {
                        self.chooser.selectDeselect(tag)
                    })
                }
            }
        }
        .padding(.horizontal, 15)
    }
}

struct UserCommentsChooserSubView: View {
    @ObservedObject var chooser: ConspectusChooser

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if self.chooser.mode == .commenting {
                TextArea(text: $chooser.userCommentText, textColor: NSColor.F.black, font: QuoteCell.nsTextFont, isEditable: true)
                    .lineSpacing(5)
                    .colorScheme(.light)
                    .frame(width: 780, height: TextArea.textHeightFrom(text: chooser.userCommentText, width: 780, font: QuoteCell.nsTextFont, isShown: true, minHeight: 50))
                    .padding(.vertical, 5)
                    .padding(.leading, 10)
                    .padding(.trailing, 10)
                    .saturation(0)

            } else if self.chooser.mode == .chooseLinkAmongUserBooksComment {
                ForEach(chooser.userBookComments, id: \.id) { comment in
                    ConspectusRow(action: { event in
                        if event == .selected {
                            self.chooser.selectedUserBookComment = comment
                        }

                    }, conspectus: comment, selectable: true, selected: self.chooser.selectedUserBookComment == comment, textColor: Color.F.black)
                }
            } else if chooser.mode == .chooseLinkAmongUserBooks {
                ForEach(chooser.userBooks, id: \.id) { userBook in
                    ConspectusRow(action: { event in
                        if event == .selected {
                            self.chooser.selectedUserBook = userBook
                            self.chooser.mode = .chooseLinkAmongUserBooksComment
                        }

                    }, conspectus: userBook, selectable: true, selected: self.chooser.selectedUserBook == userBook, textColor: Color.F.black)
                }
            } else {
                Spacer()
            }
        }
    }
}

struct ChooserFooter: View {
    enum ChooserResult {
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
    let height: CGFloat = 30
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
                .padding(.horizontal, 8)
                .background(self.isSelected ? Color(rgb: 0xEFE3CF) : Color.F.clear)
                .cornerRadius(4)
                .onTapGesture {
                    self.onTapAction?()
                }
            
            Spacer()
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
