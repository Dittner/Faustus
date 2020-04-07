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
            }

            if vm.isModalViewShown {
                ZStack(alignment: .center) {
                    GeometryReader { _ in
                        YesNoSheet(title: "Unwiderruflich löschen?", action: { result in
                            if result == .yes {
                                self.vm.removeSelectedConspectus()
                            }
                            self.vm.isModalViewShown = false
                        })
                    }

                }.frame(minWidth: 1500, idealWidth: 1500, maxWidth: .infinity, minHeight: 900, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .background(Color.F.black.opacity(0.25))
            }

        }.edgesIgnoringSafeArea(.all)
    }
}

struct YesNoSheet: View {
    enum YesNoResult: Int {
        case yes
        case no
    }

    let title: String
    let action: (YesNoResult) -> Void

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            Text(title)
                .lineLimit(1)
                .font(Font.custom(.pragmaticaExtraLight, size: 21))
                .foregroundColor(Color.F.white)
                .frame(width: 300, height: 100)

            HStack(alignment: .bottom, spacing: 100) {
                Button("", action: {
                    self.action(.no)
                }).buttonStyle(GreenButtonStyle(title: "NEIN"))
                    .frame(width: 100, height: 50)

                Button("", action: {
                    self.action(.yes)
                }).buttonStyle(RedButtonStyle(title: "JA"))
                    .frame(width: 100, height: 50)
            }
        }

        .frame(width: 300, height: 150)
        .background(Color.F.dark)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}
