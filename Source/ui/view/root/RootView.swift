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

            if vm.isModalViewShow {
                if self.vm.deleteConfirmationController.isModalViewShow {
                    GeometryReader { _ in
                        DeleteConfirmation(controller: self.vm.deleteConfirmationController)
                    }.background(Color.F.black.opacity(0.25))
                } else if self.vm.booksChooserController.isModalViewShow {
                    GeometryReader { _ in
                        BooksChooser(controller: self.vm.booksChooserController)
                    }.background(Color.F.black.opacity(0.25))
                }
            }

        }.edgesIgnoringSafeArea(.all)
    }
}

struct DeleteConfirmation: View {
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @ObservedObject var controller: DeleteConfirmationController

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            Text("Unwiderruflich löschen?")
                .lineLimit(1)
                .font(Font.custom(.pragmaticaExtraLight, size: 21))
                .foregroundColor(Color.F.white)
                .frame(width: 300, height: 100)

            HStack(alignment: .bottom, spacing: 100) {
                Button("", action: {
                    self.modalViewObservable.isShown = false
                    self.controller.apply()
                }).buttonStyle(RedButtonStyle(title: "JA"))
                    .frame(width: 100, height: 50)

                Button("", action: {
                    self.modalViewObservable.isShown = false
                    self.controller.cancel()
                }).buttonStyle(GreenButtonStyle(title: "NEIN"))
                    .frame(width: 100, height: 50)
            }
        }.onAppear { self.modalViewObservable.isShown = true }
            .frame(width: 300, height: 150)
            .background(Color.F.modalViewBG)
            .cornerRadius(5)
            .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct BooksChooser: View {
    @EnvironmentObject var textFocus: TextFocus
    @EnvironmentObject var modalViewObservable: ModalViewObservable
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

            HStack(alignment: .bottom, spacing: 200) {
                Button("", action: {
                    self.modalViewObservable.isShown = false
                    self.controller.cancel()
                }).buttonStyle(RedButtonStyle(title: "Abbrechen"))
                    .frame(width: 150, height: 50)

                Button("", action: {
                    self.modalViewObservable.isShown = false
                    self.controller.apply()
                }).buttonStyle(GreenButtonStyle(title: "Sichern"))
                    .frame(width: 150, height: 50)
            }
        }.onAppear { self.modalViewObservable.isShown = true }
            .frame(width: 500, height: 700)
            .background(Color.F.modalViewBG)
            .cornerRadius(5)
            .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}
