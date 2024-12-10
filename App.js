import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import {
  NavigationContainer,
  CommonActions,
  useNavigation,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { ThemeProvider, createTheme } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  FontAwesome,
  FontAwesome5,
  Fontisto,
  AntDesign,
} from "@expo/vector-icons";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AxiosHealth from "./src/Interceptor/AxiosHealth";
import HomeScreen from "./src/modules/Home";
import LoginComponente from "./src/modules/Usuario/LoginComponente";
import HistoriaMedicaAgregar from "./src/modules/HistoriaMedica/HistoriaMedicaAgregar";
import Documentos from "./src/modules/Documentos";
import AgendaTurnos from "./src/modules/agenda/Agenda";
import Grupos from "./src/modules/Grupos/Grupos";
import GrupoDetalles from "./src/modules/Grupos/GruposDetalles";
import InstitucionSalud from "./src/modules/InsitucionesSalud/InstitucionSalud";
import InstitucionAgregar from "./src/modules/InsitucionesSalud/InstitucionAgregar";
import MedicacionHabitual from "./src/modules/Medicamentos/MedicacionHabitual";
import AgregarMedicacionHabitutal from "./src/modules/Medicamentos/AgregarMedicacionHabitutal";
import ProfesionalSalud from "./src/modules/ProfesionalSalud/ProfesionalSalud";
import ProfesionalAgregar from "./src/modules/ProfesionalSalud/ProfesionalAgregar";
import Recordatorios from "./src/modules/Recordatorios";
import SignosVitales from "./src/modules/SignosVitales/SignosVitales";
import Vacunas from "./src/modules/Vacunas/Vacunas";
import Usuario from "./src/modules/Usuario";
import FotoPerfil from "./src/modules/Usuario/FotoPerfil";
import Informacion from "./src/modules/Usuario/Informacion";
import Contactos from "./src/modules/Usuario/Contactos";
import HistoriaMedica from "./src/modules/HistoriaMedica/HistoriaMedica";
import VisitaMedicaDetallada from "./src/components/details/VisitaMedicaDetallada";
import CustomHeader from "./src/components/CustomHeader";
import AdjuntarDocumento from "./src/modules/HistoriaMedica/Modal/AdjutarDocumento";
import { LoadingProvider } from "./src/components/LoadingContext";
import "react-native-gesture-handler";
import generatePdf from "./src/modules/temp_muestra/generatePdf";
import Informes from "./src/modules/Informes/Informes";
import SignosVitalesAgregar from "./src/modules/SignosVitales/SignosVitalesAgregar";
import SignosVitalesVer from "./src/modules/SignosVitales/SignosVitalesVer";
import axios from "axios";
import { StatusBar } from "@gluestack-ui/themed";
import AgendaTurnosAgregar from "./src/modules/agenda/AgendaAgregar";
const Drawer = createDrawerNavigator();
const SignosVitalesStack = createStackNavigator();
const GruposStack = createStackNavigator();
const ProfesionalSaludStack = createStackNavigator();
const MedicamentosStack = createStackNavigator();
const InstitucionSaludStack = createStackNavigator();
const HistoriaStack = createStackNavigator();
const InformesStack = createStackNavigator();
const AgendaStack = createStackNavigator();
const UsuarioStack = createStackNavigator();
const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

function SignosVitalesStackScreen() {
  return (
    <SignosVitalesStack.Navigator screenOptions={{ headerShown: false }}>
      <SignosVitalesStack.Screen
        name="SignosVitales"
        component={SignosVitales}
        options={{ unmountOnBlur: true }}
      />
      <SignosVitalesStack.Screen
        name="SignosVitalesAgregar"
        component={SignosVitalesAgregar}
        options={{ unmountOnBlur: true }}
      />
      <SignosVitalesStack.Screen
        name="SignosVitalesVer"
        component={SignosVitalesVer}
        options={{ unmountOnBlur: true }}
      />
    </SignosVitalesStack.Navigator>
  );
}

function GruposStackScreen() {
  return (
    <GruposStack.Navigator screenOptions={{ headerShown: false }}>
      <GruposStack.Screen
        name="GruposList"
        component={Grupos}
        options={{ unmountOnBlur: true }}
      />
      <GruposStack.Screen
        name="GrupoDetalles"
        component={GrupoDetalles}
        options={{ unmountOnBlur: true }}
      />
    </GruposStack.Navigator>
  );
}

function ProfesionalSaludStackScreen() {
  return (
    <ProfesionalSaludStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfesionalSaludStack.Screen
        name="ProfesionalSaludList"
        component={ProfesionalSalud}
        options={{ unmountOnBlur: true }}
      />
      <ProfesionalSaludStack.Screen
        name="AgregarProfesional"
        component={ProfesionalAgregar}
        options={{ unmountOnBlur: true }}
      />
    </ProfesionalSaludStack.Navigator>
  );
}

function MedicamentosStackScreen() {
  return (
    <MedicamentosStack.Navigator screenOptions={{ headerShown: false }}>
      <MedicamentosStack.Screen
        name="MedicamentosList"
        component={MedicacionHabitual}
        options={{ unmountOnBlur: true }}
      />
      <MedicamentosStack.Screen
        name="AgregarMedicacion"
        component={AgregarMedicacionHabitutal}
        options={{ unmountOnBlur: true }}
      />
    </MedicamentosStack.Navigator>
  );
}


function InstitucionSaludStackScreen() {
  return (
    <InstitucionSaludStack.Navigator screenOptions={{ headerShown: false }}>
      <InstitucionSaludStack.Screen
        name="InstitucionSaludList"
        component={InstitucionSalud}
        options={{ unmountOnBlur: true }}
      />
      <InstitucionSaludStack.Screen
        name="AgregarInstitucion"
        component={InstitucionAgregar}
        options={{ unmountOnBlur: true }}
      />
    </InstitucionSaludStack.Navigator>
  );
}

function HistoriaMedicaStackScreen() {
  return (
    <HistoriaStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoriaStack.Screen
        name="HistoriaMedicaList"
        component={HistoriaMedica}
        options={{ unmountOnBlur: true }}
      />
      <HistoriaStack.Screen
        name="AgregarVisitaMedica"
        component={HistoriaMedicaAgregar}
        options={{ unmountOnBlur: true }}
      />
      <HistoriaStack.Screen
        name="VisitaMedicaDetallada"
        component={VisitaMedicaDetallada}
        options={{ unmountOnBlur: true }}
      />
      <HistoriaStack.Screen
        name="AdjuntarDocumento"
        component={AdjuntarDocumento}
      />
    </HistoriaStack.Navigator>
  );
}

function InformesStackScreen() {
  return (
    <InformesStack.Navigator screenOptions={{ headerShown: false }}>
      <InformesStack.Screen
        name="InformesList"
        component={Informes}
        options={{ unmountOnBlur: true }}
      />
      <InformesStack.Screen
        name="VisitaMedicaDetallada"
        component={VisitaMedicaDetallada}
        options={{ unmountOnBlur: true }}
      />
    </InformesStack.Navigator>
  );
}

function AgendaStackScreen() {
  return (
    <AgendaStack.Navigator screenOptions={{ headerShown: false }}>
      <AgendaStack.Screen
        name="Agenda"
        component={AgendaTurnos}
        options={{ unmountOnBlur: true }}
      />
      <AgendaStack.Screen
        name="AgendaTurnosAgregar"
        component={AgendaTurnosAgregar}
        options={{ unmountOnBlur: true }}
      />
    </AgendaStack.Navigator>
  );
}

function UsuarioStackScreen({ navigation }) {
  return (
    <UsuarioStack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <UsuarioStack.Screen
        name="UsuarioConfig"
        component={Usuario}
        options={{
          title: "Configuración de Usuario",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={25} />
            </TouchableOpacity>
          ),
        }}
      />
      <UsuarioStack.Screen
        name="FotoPerfil"
        component={FotoPerfil}
        options={{
          title: "Foto De Perfil",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("UsuarioConfig")}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={25} />
            </TouchableOpacity>
          ),
        }}
      />
      <UsuarioStack.Screen
        name="Informacion"
        component={Informacion}
        options={{
          title: "Información",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("UsuarioConfig")}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={25} />
            </TouchableOpacity>
          ),
        }}
      />
      <UsuarioStack.Screen
        name="Contactos"
        component={Contactos}
        options={{
          title: "Contactos",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("UsuarioConfig")}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={25} />
            </TouchableOpacity>
          ),
        }}
      />
    </UsuarioStack.Navigator>
  );
}

function RootStackScreen({ isLoggedIn, setIsLoggedIn }) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainDrawer">
        {() => (
          <DrawerScreen isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        )}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}

function AuthStackScreen({ setIsLoggedIn, handleLogin }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginComponente
            {...props}
            onLogin={handleLogin}  // Pasa `handleLogin` a LoginComponente
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function DrawerScreen({ isLoggedIn, setIsLoggedIn }) {
  const handleCerrarSesion = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        drawerActiveBackgroundColor: "#28b4e2",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { marginLeft: -25, fontSize: 15 },
      }}
      drawerContent={(props) => (
        <CustomHeader
          estaLogueado={isLoggedIn}
          onCerrarSesion={handleCerrarSesion}
          {...props}  
        />
      )}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="Historia Medica"
        component={HistoriaMedicaStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <FontAwesome name="hospital-o" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
            <Drawer.Screen
        name="Profesionales Salud"
        component={ProfesionalSaludStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Fontisto name="doctor" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="Instituciones Salud"
        component={InstitucionSaludStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <FontAwesome name="hospital-o" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
       <Drawer.Screen
        name="Vacunas"
        component={Vacunas}
        options={{
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="syringe" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
            <Drawer.Screen
        name="Medicacion Habitual"
        component={MedicamentosStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Fontisto name="pills" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
        <Drawer.Screen
        name="Grupos"
        component={GruposStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
            <Drawer.Screen
        name="Agenda"
        component={AgendaStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="Documentos"
        component={Documentos}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
       <Drawer.Screen
        name="Signos Vitales"
        component={SignosVitalesStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="heartbeat" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="Informes"
        component={InformesStackScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="Usuario"
        component={UsuarioStackScreen}
        options={{ drawerItemStyle: { height: 0 }, headerShown: false }}
      />
    </Drawer.Navigator>
  );
}


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "InstrumentSerif-Regular": require("./src/assets/font/InstrumentSerif-Italic.ttf"),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const theme = createTheme({
    components: {
      CheckBox: {
        containerStyle: {
          backgroundColor: "transparent",
          borderWidth: 0,
        },
      },
    },
    lightColors: {
      cancel: "#FF0000",
    },
    darkColors: {
      cancel: "#FF0000",
    },
  });

  const handleLogin = async (emailOrIdToken, password = null) => {
    try {
      // Limpia datos previos de sesión
      await AsyncStorage.removeItem("PerfilUsuario");
  
      let response;
  
      if (password) {
        // Inicio de sesión con correo y contraseña usando AxiosHealth
        response = await AxiosHealth.post("/login", {
          mail: emailOrIdToken,
          password: password,
        });
      } else {

        console.log(emailOrIdToken);
        response = await axios.post(
          "https://backendvtest-a80d56fb412f.herokuapp.com/api/login/google", 
          { tokenId: emailOrIdToken },
          {
            includeAuth: false 
          }
        );
  
        // Recupera datos adicionales si es necesario usando AxiosHealth
        const generosResponse = await AxiosHealth.get("/generos", {
          includeAuth: false,
        });
        const generoSelect = generosResponse.data.slice(0, 2);
        await AsyncStorage.setItem("generoSelect", JSON.stringify(generoSelect));
      }
  
      // Almacena los datos de sesión
      await AsyncStorage.setItem("auth_token", response.data.token);
      await AsyncStorage.setItem(
        "idHc",
        JSON.stringify(response.data.historiaMedicaId)
      );
  
      // Recupera y guarda el perfil del usuario
      const userProfile = await AxiosHealth.get("usuarios");
      await AsyncStorage.setItem("PerfilUsuario", JSON.stringify(userProfile.data));
  
      // Cambia el estado de autenticación
      setIsLoggedIn(true);
      return null; // Sin errores
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      return error; // Devuelve el error para manejarlo en `LoginComponente`
    }
  };
  
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#5BACFF" barStyle="light-content" />
          <LoadingProvider>
            {isLoggedIn ? (
              <RootStackScreen
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            ) : (
              <AuthStackScreen
                setIsLoggedIn={setIsLoggedIn}
                handleLogin={handleLogin}
              />
            )}
          </LoadingProvider>
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
