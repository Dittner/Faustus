//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct LoginView: View {
    @ObservedObject private var vm = LoginViewModel()

    var body: some View {
        VStack(alignment: .center, spacing: 12.0) {
            Spacer()

            Text("Faustus")
                .font(Font.custom("ManuskriptGothisch", size: 60))
                .lineLimit(1)
                .frame(maxWidth: 250, maxHeight: 20)
                .multilineTextAlignment(.leading)
                .foregroundColor(Color.F.light)
                .offset(x: /*@START_MENU_TOKEN@*/0.0/*@END_MENU_TOKEN@*/, y: -80.0)

            LoginTextInput("Name", text: $vm.userName, isSecure: false, onEnter: {
                print("Name on Entered!")
            })
                .frame(width: 250, height: 35, alignment: .leading)

            LoginTextInput("Passwort", text: $vm.userPwd, isSecure: true, onEnter: {
                print("Pwd on Entered!")
                self.vm.login()
            })
                .frame(width: 250, height: 35, alignment: .leading)

            Text($vm.errorMsg.wrappedValue)
                .frame(maxWidth: 250, maxHeight: 50)
                .foregroundColor(Color.F.invalid)
                .opacity($vm.errorMsg.wrappedValue != "" ? 1 : 0)

            Text("OK")
                .frame(maxWidth: 250, maxHeight: 50)
                .foregroundColor(Color.green)
                .opacity($vm.isLoggedIn.wrappedValue ? 1 : 0)

            Spacer()
        }.frame(minWidth: 600, maxWidth: .infinity, minHeight: 800, maxHeight: .infinity)
            .background(Color.F.dark)
    }

    public struct CustomTextFieldStyle: TextFieldStyle {
        public func _body(configuration: TextField<Self._Label>) -> some View {
            configuration
                .textFieldStyle(PlainTextFieldStyle())
                .padding(5)
                .foregroundColor(Color.F.light)
                .frame(width: 250, height: 35, alignment: .leading)
                .background(Color.F.black)
                .cornerRadius(6)
                .font(.system(size: 16))
        }
    }
}

#if DEBUG
    struct LoginView_Previews: PreviewProvider {
        static var previews: some View {
            LoginView()
        }
    }
#endif
