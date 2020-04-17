//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject var vm: RootViewModel

    private let panelsWidth: CGFloat = 400

    var body: some View {
        ZStack(alignment: .center) {
            if vm.screen == .login {
                BlurAppBG()
                    .frame(minWidth: 500, idealWidth: 500, maxWidth: 500, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)

//                DemoView()
//                    .frame(minWidth: 500, idealWidth: 500, maxWidth: 500, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)

                LoginView()
                    .frame(minWidth: 500, idealWidth: 500, maxWidth: 500, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)

            } else {
                BlurAppBG()
                HStack(alignment: .top, spacing: 0) {
                    SearchView()
                        .frame(minWidth: 250, idealWidth: panelsWidth, maxWidth: .infinity, minHeight: 0, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    DocView()
                        .frame(minWidth: 1000, idealWidth: 1000, maxWidth: 1000, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)
                    HistoryView()
                        .frame(minWidth: 250, idealWidth: panelsWidth, maxWidth: .infinity, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)
                }.frame(minWidth: 1500, idealWidth: 1500, maxWidth: .infinity, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)

                if vm.keyLinesShown {
                    GeometryReader { geo in
                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: 25, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: 50, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - 530, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - 515, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - 485, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - 445, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 + 485, y: 0)

                        // horizontal

                        Separator(color: Color.F.debugLines, width: .infinity)
                            .offset(x: 0, y: 20)

                        Separator(color: Color.F.debugLines, width: .infinity)
                            .offset(x: 0, y: 50)

                    }.opacity(0.5)
                }
            }

            ModalView(controller: vm.notificationController)

        }.edgesIgnoringSafeArea(.all)
    }
}

struct ModalView: View {
    @EnvironmentObject var vm: RootViewModel
    @ObservedObject var controller: NotificationController

    var body: some View {
        ZStack(alignment: .center) {
            if self.vm.modalView == .deleteConfirmation {
                GeometryReader { _ in
                    DeleteConfirmation(controller: self.vm.deleteConfirmationController)
                }.background(Color.F.black.opacity(0.25))
            } else if self.vm.modalView == .booksChooser {
                GeometryReader { _ in
                    BooksChooser(controller: self.vm.booksChooserController)
                }.background(Color.F.black.opacity(0.25))
            } else if self.vm.modalView == .authorChooser {
                GeometryReader { _ in
                    AuthorChooser(controller: self.vm.authorChooserController)
                }.background(Color.F.black.opacity(0.25))
            } else if self.vm.modalView == .parentTagChooser {
                GeometryReader { _ in
                    ParentTagChooser(controller: self.vm.parentTagChooserController)
                }.background(Color.F.black.opacity(0.25))
            } else if self.vm.modalView == .tagsChooser {
                GeometryReader { _ in
                    TagsChooser(controller: self.vm.tagsChooserController)
                }.background(Color.F.black.opacity(0.25))
            }

            if !controller.msg.isEmpty {
                Text(controller.msg)
                    .lineLimit(1)
                    .font(Font.custom(.mono, size: 16))
                    .frame(width: 300, height: 40)
                    .foregroundColor(Color.F.white)
                    .padding(.horizontal, 15)
                    .background(Color.F.dark)
                    .cornerRadius(2)
                    .shadow(color: Color.F.black05, radius: 3, x: 0, y: 3)
                    .opacity(controller.isShown ? 1 : 0)
            }
        }
    }
}

struct DeleteConfirmation: View {
    @ObservedObject var controller: DeleteConfirmationController

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            Text("Unwiderruflich löschen?")
                .lineLimit(1)
                .font(Font.custom(.pragmaticaExtraLight, size: 21))
                .foregroundColor(Color.F.white)
                .frame(width: 300, height: 100)

            ModalViewFooter(controller: controller)
        }
        .frame(width: 300, height: 150)
        .background(Color.F.modalViewBG)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct BooksChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var controller: BooksChooserController

    func select(b: Book) {
        controller.selectedBooks.append(b)
    }

    func deselect(b: Book) {
        controller.selectedBooks.removeAll { $0.id == b.id }
    }

    var body: some View {
        VStack(alignment: .center, spacing: 1) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.white)
                    .frame(width: 50)

                TextInput(title: "", text: $controller.filterText, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: textFocus.id == .modalBookChooserSearch, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.dark)
                    .onAppear {
                        self.textFocus.id = .modalBookChooserSearch
                    }
            }.background(Color.F.black)

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

                            }, conspectus: book, selectable: true, selected: self.controller.selectedBooks.contains(book))
                                .frame(height: 50)
                        }
                    }
                }
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(width: 500, height: 700)
        .background(Color.F.modalViewBG)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct AuthorChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var controller: AuthorChooserController

    var body: some View {
        VStack(alignment: .center, spacing: 1) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.white)
                    .frame(width: 50)

                TextInput(title: "", text: $controller.filterText, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: textFocus.id == .modalBookChooserSearch, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.dark)
                    .onAppear {
                        self.textFocus.id = .modalBookChooserSearch
                    }
            }.background(Color.F.black)

            if controller.filteredAuthors.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(controller.filteredAuthors, id: \.id) { author in
                            ConspectusRow(action: { event in
                                if event == .selected {
                                    self.controller.selectedAuthor = author
                                }

                            }, conspectus: author, selectable: true, selected: self.controller.selectedAuthor == author)
                                .frame(height: 50)
                        }
                    }
                }
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(width: 500, height: 700)
        .background(Color.F.modalViewBG)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct ParentTagChooser: View {
    @ObservedObject var controller: ParentTagChooserController
    @ObservedObject var state: ConspectusState
    @ObservedObject var owner: Tag
    let tagNodes: [TagTreeNode]

    init(controller: ParentTagChooserController) {
        self.controller = controller
        state = controller.owner.state
        owner = controller.owner
        tagNodes = controller.tagTree.compactTree { $0.tag.id != controller.owner.id }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if tagNodes.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(tagNodes, id: \.tag.id) { node in
                            TagTreeNodeLink(node: node, isSelected: self.controller.selectedTag == node.tag, action: {
                                self.controller.selectedTag = self.controller.selectedTag == node.tag ? nil : node.tag
                            })
                                .font(Font.custom(.pragmaticaLight, size: 21))
                        }
                    }.padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .frame(width: 500, alignment: .topLeading)
                }.frame(width: 500, height: 650, alignment: .topLeading)
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)
        }
        .frame(width: 500, height: 700)
        .background(Color.F.modalViewBG)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct TagsChooser: View {
    @ObservedObject var controller: TagsChooserController
    let tagNodes: [TagTreeNode]

    init(controller: TagsChooserController) {
        self.controller = controller
        tagNodes = controller.tagTree.nodeList
        print("TagsChooser init")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if tagNodes.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(tagNodes, id: \.tag.id) { node in
                            TagTreeNodeLink(node: node, isSelected: self.controller.selectedTags.contains(node.tag), action: {
                                self.controller.selectDeselect(node.tag)
                            })
                                .font(Font.custom(.pragmaticaLight, size: 18))
                        }
                    }.padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .frame(width: 500, alignment: .topLeading)
                }.frame(width: 500, height: 650, alignment: .topLeading)
            } else {
                Spacer()
            }

            ModalViewFooter(controller: controller)

        }.frame(width: 500, height: 700)
            .background(Color.F.modalViewBG)
            .cornerRadius(5)
            .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
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
                .frame(width: 100, height: 50)

            Spacer()

            Button("", action: {
                self.modalViewObservable.isShown = false
                self.controller.apply()
            }).buttonStyle(GreenButtonStyle())
                .frame(width: 100, height: 50)

        }.onAppear { self.modalViewObservable.isShown = true }
    }
}

struct TagTreeNodeLink: View {
    @ObservedObject var tag: Tag
    @ObservedObject var state: ConspectusState
    private let node: TagTreeNode
    let isSelected: Bool
    let levelOffset: CGFloat
    let levelWidth: Int = 40
    let height: CGFloat = 30
    let onTapAction: (() -> Void)?

    init(node: TagTreeNode, isSelected: Bool, action: (() -> Void)?) {
        self.node = node
        tag = node.tag
        state = node.tag.state

        self.isSelected = isSelected
        levelOffset = CGFloat(node.level * levelWidth)
        onTapAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            TreeNodeLines(node: node, levelWidth: levelWidth)
                .stroke()
                .foregroundColor(Color.F.white)
                .opacity(0.25)
                .frame(width: levelOffset, height: height)

            Text(tag.content.name)
                .lineLimit(1)
                .padding(.horizontal, 5)
                .frame(height: height)
                .foregroundColor(self.isSelected ? Color.F.black : self.state.isRemoved ? Color.F.red : Color.F.white)
                .background(self.isSelected ? self.state.isRemoved ? Color.F.red : Color.F.white : Color.F.clear)
                .offset(x: -5, y: 0)
                .onTapGesture {
                    self.onTapAction?()
                }
        }
    }
}

struct TreeNodeLines: Shape {
    let node: TagTreeNode
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
