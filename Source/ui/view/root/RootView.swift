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
                        .frame(minWidth: 1000, idealWidth: 1000, maxWidth: 1000, minHeight: 800, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)
                    HistoryView()
                        .frame(minWidth: 250, idealWidth: panelsWidth, maxWidth: .infinity, minHeight: 800, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)
                }.frame(minWidth: 1500, idealWidth: 1500, maxWidth: .infinity, minHeight: 900, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)

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

            if self.vm.modalView == .confirmDelete {
                GeometryReader { _ in
                    DeleteConfirmation(controller: self.vm.deleteConfirmationController)
                }.background(Color.F.black.opacity(0.25))
            } else if self.vm.modalView == .chooseBooks {
                GeometryReader { _ in
                    BooksChooser(controller: self.vm.booksChooserController)
                }.background(Color.F.black.opacity(0.25))
            }

        }.edgesIgnoringSafeArea(.all)
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

            HStack(alignment: .bottom, spacing: 100) {
                Button("", action: {
                    self.controller.result = .deleted
                }).buttonStyle(RedButtonStyle(title: "JA"))
                    .frame(width: 100, height: 50)

                Button("", action: {
                    self.controller.result = .canceled
                }).buttonStyle(GreenButtonStyle(title: "NEIN"))
                    .frame(width: 100, height: 50)
            }
        }

        .frame(width: 300, height: 150)
        .background(Color.F.dark)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}

struct BooksChooser: View {
    @ObservedObject var controller: BooksChooserController

    func select(c: Conspectus) {
        controller.selectedBooks.append(c)
    }

    func deselect(c: Conspectus) {
        controller.selectedBooks.removeAll { $0.id == c.id }
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            Text("Wählen Sie bitte erwünschte Bücher aus")
                .lineLimit(1)
                .font(Font.custom(.pragmaticaExtraLight, size: 18))
                .background(Color.F.white.opacity(0.5))
                .foregroundColor(Color.F.white)
                .frame(width: 500, height: 50)

            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 1) {
                    ForEach(controller.allBooks, id: \.id) { conspectus in
                        ConspectusRow(action: { event in
                            if event == .selected {
                                self.select(c: conspectus)
                            } else {
                                self.deselect(c: conspectus)
                            }

                        }, conspectus: conspectus, selectable: true, selected: self.controller.selectedBooks.contains(conspectus))
                            .frame(height: 50)
                    }
                }
            }

            HStack(alignment: .bottom, spacing: 200) {
                Button("", action: {
                    self.controller.cancel()
                }).buttonStyle(RedButtonStyle(title: "Abbrechen"))
                    .frame(width: 150, height: 50)

                Button("", action: {
                    self.controller.apply()
                }).buttonStyle(GreenButtonStyle(title: "Speichern"))
                    .frame(width: 150, height: 50)
            }
        }

        .frame(width: 500, height: 700)
        .background(Color.F.dark)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}
