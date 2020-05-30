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
    @EnvironmentObject var docViewModel: DocViewModel

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
                        .frame(minWidth: 200, idealWidth: panelsWidth, maxWidth: .infinity, minHeight: 0, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)

                    DocView(vm: docViewModel)
                        .frame(minWidth: Constants.docViewAndScrollerWidth, idealWidth: Constants.docViewAndScrollerWidth, maxWidth: Constants.docViewAndScrollerWidth, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)

                    HistoryView()
                        .frame(minWidth: 200, idealWidth: panelsWidth, maxWidth: .infinity, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .center)
                }.frame(minWidth: 1550, idealWidth: 1550, maxWidth: .infinity, minHeight: 700, idealHeight: .infinity, maxHeight: .infinity, alignment: .topLeading)

                if vm.keyLinesShown {
                    GeometryReader { geo in
                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: 25, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: 50, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - Constants.docViewAndScrollerWidth / 2 - 15, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - Constants.docViewAndScrollerWidth / 2 + 15, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 - Constants.docViewAndScrollerWidth / 2 + Constants.docViewLeading, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 + Constants.docViewAndScrollerWidth / 2 - 15, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2, y: 0)

                        Separator(color: Color.F.debugLines, height: .infinity)
                            .offset(x: geo.size.width / 2 + Constants.docViewAndScrollerWidth / 2 + 25, y: 0)

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

            ChooserFooter(controller: controller)
        }
        .frame(width: 300, height: 150)
        .background(Color.F.dark)
        .cornerRadius(5)
        .shadow(color: Color.F.black05, radius: 5, x: 0, y: 5)
    }
}
