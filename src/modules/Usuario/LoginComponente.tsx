import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  findNodeHandle 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import InputComponent from '../../components/inputs/InputComponent';
import ButtonHealth from '../../components/ButtonHealth';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import AlertCustom from '../../components/AlertCustom';
import DropdownComponent from '../../components/inputs/DropdownComponent';
import DatePickerComponent from '../../components/inputs/DatePickerComponent';
import { Dialog } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoading } from '../../components/LoadingContext';

// Configuración de Google Sign-In
GoogleSignin.configure({
  webClientId: "67224328580-e27l88ol5oto5ffhmnoob2jut5ceanjv.apps.googleusercontent.com", 
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});


// Esquemas de Validación
const registrationSchema = Yup.object().shape({
  emailRegister: Yup.string()
    .email('Por favor ingresa un email válido')
    .required('Este campo es obligatorio'),
  emailRegisterRepeat: Yup.string()
    .email('Repita el email')
    .oneOf([Yup.ref('emailRegister'), null], 'Los emails deben coincidir')
    .required('Este campo es obligatorio'),
  passwordRegister: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Este campo es obligatorio'),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref('passwordRegister'), null], 'Las contraseñas deben coincidir')
    .required('Este campo es obligatorio'),
  nombre: Yup.string().required('Este campo es obligatorio'),
  apellido: Yup.string().required('Este campo es obligatorio'),
  dni: Yup.string().required('Este campo es obligatorio'),
  dniRepeat: Yup.string()
    .oneOf([Yup.ref('dni'), null], 'El DNI debe coincidir')
    .required('Este campo es obligatorio'),
  genero: Yup.string().required('El género es obligatorio'),
  fechaNacimiento: Yup.date().required('Fecha de nacimiento es obligatoria'),
});

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Por favor ingresa un email válido')
    .required('Este campo es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Este campo es obligatorio'),
});

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Por favor ingresa un email válido')
    .required('Este campo es obligatorio'),
});

const verifyAccountSchema = Yup.object().shape({
  verificationCode: Yup.string()
    .required('El código de verificación es obligatorio'),
});

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .required('La nueva contraseña es obligatoria'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
    .required('Debe confirmar la nueva contraseña'),
    codigo: Yup.string()
    .required('El código de verificación es obligatorio'),
});

const LoginComponente = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [alertaVisible, setAlertaVisible] = useState(false);
  const [alertaVisibleSucess, setAlertaVisibleSucess] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [mensajeAlertaSucess, setMensajeAlertaSucess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmailState] = useState('');
  const [savedPassword, setSavedPasswordState] = useState('');
  
  // Estados para el flujo de restablecimiento de contraseña
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  
  // Estados para el flujo de verificación de cuenta
  const [isVerifyAccountVisible, setIsVerifyAccountVisible] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  
  const { setLoading } = useLoading();
  const scrollViewRef = useRef(null);

  // Definir todas las referencias de input necesarias
  const inputRefs = {
    nombre: useRef(null),
    apellido: useRef(null),
    dni: useRef(null),
    dniRepeat: useRef(null),
    fechaNacimiento: useRef(null),
    genero: useRef(null),
    emailRegister: useRef(null),
    emailRegisterRepeat: useRef(null),
    passwordRegister: useRef(null),
    repeatPassword: useRef(null),
    email: useRef(null),
    password: useRef(null),
    verificationCode: useRef(null),
    newPassword: useRef(null),
    confirmNewPassword: useRef(null),
    codigo: useRef(null)
  };

  const generoData = [
    { label: "Masculino", value: "MASCULINO" },
    { label: "Femenino", value: "FEMENINO" },
  ];

  const toggleRegistering = () => {
    setIsRegistering(!isRegistering);
  };

  // Manejo del Registro
  const handleRegisterPress = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      await AxiosHealth.post('register/pacientes', {
        nombre: values.nombre,
        apellido: values.apellido,
        mail: values.emailRegister,
        password: values.passwordRegister,
        documento: values.dni,
        genero: values.genero,
        fechaNacimiento: values.fechaNacimiento,
      });
      setAlertaVisibleSucess(true);
      setMensajeAlertaSucess("Registro exitoso! Ahora puedes iniciar sesión.");
      setIsRegistering(false);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      setMensajeAlerta(error.response?.data || "Error al registrar");
      setAlertaVisible(true);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Manejo del Inicio de Sesión
  const handleLoginPress = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
      const loginError = await onLogin(values.email, values.password);
      if (loginError) {
        if (loginError.response) {
          const status = loginError.response.status;
          console.log(status)
          if (status === 401) {
            setMensajeAlerta("Credenciales incorrectas. Verifique su email y contraseña.");
            setAlertaVisible(true);
          } else if (status === 404) {
            // Mostrar opción de verificación de cuenta
            setEmailForVerification(values.email);
            setIsVerifyAccountVisible(true);
          } else {
            setMensajeAlerta("Error inesperado");
            setAlertaVisible(true);
          }
        } else if (loginError.code === "ERR_NETWORK") {
          setMensajeAlerta(
            "Al parecer los servidores están caídos. Intente nuevamente más tarde. " +
              loginError.code
          );
          setAlertaVisible(true);
        } else {
          setMensajeAlerta("Error inesperado. " + loginError.code);
          setAlertaVisible(true);
        }
        return; // Detén el flujo si hay un error
      }

      // Si el inicio de sesión es exitoso, maneja el "Recordar usuario"
      rememberMe
        ? (await AsyncStorage.setItem("savedEmail", values.email),
           await AsyncStorage.setItem("savedPassword", values.password))
        : (await AsyncStorage.removeItem("savedEmail"),
           await AsyncStorage.removeItem("savedPassword"));

           setLoading(false)
    } catch (error) {
      setLoading(false)
      const errorMessage = error || "Error al iniciar sesión. Intente de nuevo.";
      setMensajeAlerta(errorMessage);
      setAlertaVisible(true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Manejo de Google Sign-In
  const signIn = async () => {
    try {
      await GoogleSignin.signOut(); // Opcional: cierra sesiones previas

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.addScopes({
        scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar"],
      });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data.idToken
      console.log(JSON.stringify(userInfo, null, 2));
      // Envía el idToken a tu backend para la autenticación
      await onLogin(idToken);
    } catch (error) {
      console.log(error.code);
      let errorMessage = "Error desconocido durante el inicio de sesión con Google.";

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = "Has cancelado el inicio de sesión.";
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = "El inicio de sesión ya está en progreso.";
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = "Los servicios de Google Play no están disponibles o no están actualizados.";
            break;
          default:
            errorMessage = "Error desconocido: " + error.message;
        }
      } else {
        errorMessage = "Error: " + error.message;
      }

      setMensajeAlerta(errorMessage);
      setAlertaVisible(true);
    }
  };

  // Función para desplazarse al input enfocado
  const scrollToInput = (ref) => {
    setTimeout(() => {
      if (ref.current && scrollViewRef.current) {
        ref.current.measureLayout(
          findNodeHandle(scrollViewRef.current),
          (x, y, width, height) => {
            scrollViewRef.current.scrollTo({ x: 0, y: y - 20, animated: true });
          },
          () => {
            console.log("Failed to measure layout");
          }
        );
      }
    }, 100);
  };

  // Solicitar código de restablecimiento de contraseña
  const handleRequestReset = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
      await AxiosHealth.put('usuarios/recuperarCuenta', {
        mail: values.email,
      });
      setEmailForReset(values.email);
      setIsForgotPasswordVisible(false);
      setIsResetPasswordVisible(true);
      setAlertaVisibleSucess(true);
      setMensajeAlertaSucess("Se ha enviado un código de verificación a tu correo.");
    } catch (error) {
      setMensajeAlerta(error.response?.data || "Error al solicitar restablecimiento de contraseña");
      setAlertaVisible(true);
    } finally {
      setSubmitting(false);
      setLoading(false)
    }
  };

  // Verificar código de verificación de cuenta
  const handleVerifyAccount = async (values, { setSubmitting }) => {
    try {
      const response = await AxiosHealth.put('/usuarios/verificarCuenta', {
        mail: emailForVerification,
        codigo: values.verificationCode,
      });


        setIsVerifyAccountVisible(false);
        setAlertaVisibleSucess(true);
        setMensajeAlertaSucess("Cuenta verificada exitosamente. Ahora puedes iniciar sesión.");

    } catch (error) {
      setMensajeAlerta(error.response?.data || "Error al verificar el código");
      setAlertaVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Restablecer la contraseña
  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      await AxiosHealth.put('usuarios/resetPassword', {
        mail: emailForReset,
        password: values.newPassword,
        codigo: values.codigo
      });
      setIsResetPasswordVisible(false);
      setAlertaVisibleSucess(true);
      setMensajeAlertaSucess("Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setMensajeAlerta(error.response?.data || "Error al restablecer la contraseña");
      setAlertaVisible(true);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isRegistering ? "Regístrate en H&S" : "Inicia Sesión"}
          </Text>

          <Formik
            initialValues={
              isRegistering
                ? {
                    emailRegister: '',
                    emailRegisterRepeat: '',
                    passwordRegister: '',
                    repeatPassword: '',
                    nombre: '',
                    apellido: '',
                    dni: '',
                    dniRepeat: '',
                    genero: '',
                    fechaNacimiento: new Date(),
                  }
                : {
                    email: savedEmail || '',
                    password: savedPassword || '',
                  }
            }
            validationSchema={isRegistering ? registrationSchema : loginSchema}
            onSubmit={isRegistering ? handleRegisterPress : handleLoginPress}
          >
            {({
              values,
              errors,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              touched,
            }) => (
              <View style={styles.form}>
                {isRegistering ? (
                  <>
                    {/* Campos de Registro */}
                    <View ref={inputRefs.nombre}>
                      <InputComponent
                        placeholder="Nombre"
                        value={values.nombre}
                        onChangeText={handleChange('nombre')}
                        onBlur={handleBlur('nombre')}
                        iconName="person"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.nombre)}
                        errorMessage={touched.nombre && errors.nombre}
                      />
                    </View>

                    <View ref={inputRefs.apellido}>
                      <InputComponent
                        placeholder="Apellido"
                        value={values.apellido}
                        onChangeText={handleChange('apellido')}
                        onBlur={handleBlur('apellido')}
                        iconName="person"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.apellido)}
                        errorMessage={touched.apellido && errors.apellido}
                      />
                    </View>

                    <View ref={inputRefs.dni}>
                      <InputComponent
                        placeholder="DNI"
                        value={values.dni}
                        onChangeText={handleChange('dni')}
                        onBlur={handleBlur('dni')}
                        iconName="badge"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.dni)}
                        errorMessage={touched.dni && errors.dni}
                      />
                    </View>

                    <View ref={inputRefs.dniRepeat}>
                      <InputComponent
                        placeholder="Repetir DNI"
                        value={values.dniRepeat}
                        onChangeText={handleChange('dniRepeat')}
                        onBlur={handleBlur('dniRepeat')}
                        iconName="badge"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.dniRepeat)}
                        errorMessage={touched.dniRepeat && errors.dniRepeat}
                      />
                    </View>

                    <View ref={inputRefs.fechaNacimiento}>
                      <DatePickerComponent
                        date={values.fechaNacimiento}
                        setDate={(date) => setFieldValue('fechaNacimiento', date)}
                        formatDate={(date) => date.toLocaleDateString()}
                        placeholder="Fecha de Nacimiento"
                        needsTime={false}
                        errorMessage={touched.fechaNacimiento && errors.fechaNacimiento}
                        containerStyle={styles.datePicker}
                        onFocus={() => scrollToInput(inputRefs.fechaNacimiento)}
                      />
                    </View>

                    <View ref={inputRefs.genero}>
                      <DropdownComponent
                        data={generoData}
                        selectedValue={
                          values.genero
                            ? generoData.find(item => item.value === values.genero)
                            : null
                        }
                        setSelectedValue={(item) => setFieldValue("genero", item.value)}
                        placeholder="Seleccione el género"
                        errorMessage={touched.genero && errors.genero ? String(errors.genero) : ""}
                        containerStyle={styles.dropdown}
                        onFocus={() => scrollToInput(inputRefs.genero)}
                      />
                    </View>

                    <View ref={inputRefs.emailRegister}>
                      <InputComponent
                        placeholder="Email"
                        value={values.emailRegister}
                        onChangeText={handleChange('emailRegister')}
                        onBlur={handleBlur('emailRegister')}
                        iconName="email"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        keyboardType="email-address"
                        onFocus={() => scrollToInput(inputRefs.emailRegister)}
                        errorMessage={touched.emailRegister && errors.emailRegister}
                      />
                    </View>

                    <View ref={inputRefs.emailRegisterRepeat}>
                      <InputComponent
                        placeholder="Repetir Email"
                        value={values.emailRegisterRepeat}
                        onChangeText={handleChange('emailRegisterRepeat')}
                        onBlur={handleBlur('emailRegisterRepeat')}
                        iconName="email"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        keyboardType="email-address"
                        onFocus={() => scrollToInput(inputRefs.emailRegisterRepeat)}
                        errorMessage={touched.emailRegisterRepeat && errors.emailRegisterRepeat}
                      />
                    </View>

                    <View ref={inputRefs.passwordRegister}>
                      <InputComponent
                        placeholder="Contraseña"
                        value={values.passwordRegister}
                        onChangeText={handleChange('passwordRegister')}
                        onBlur={handleBlur('passwordRegister')}
                        iconName="lock"
                        iconLibrary="Entypo"
                        secureTextEntry={true}
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.passwordRegister)}
                        errorMessage={touched.passwordRegister && errors.passwordRegister}
                      />
                    </View>

                    <View ref={inputRefs.repeatPassword}>
                      <InputComponent
                        placeholder="Repetir Contraseña"
                        value={values.repeatPassword}
                        onChangeText={handleChange('repeatPassword')}
                        onBlur={handleBlur('repeatPassword')}
                        iconName="lock"
                        iconLibrary="Entypo"
                        secureTextEntry={true}
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.repeatPassword)}
                        errorMessage={touched.repeatPassword && errors.repeatPassword}
                      />
                    </View>

                    <ButtonHealth
                      title="Registrar"
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    />

                    <View style={styles.dividerContainer}>
                      <View style={styles.line} />
                    </View>

                    <View style={styles.buttonRow}>
                      <ButtonHealth
                        title="Google"
                        onPress={signIn}
                        iconName="google"
                        iconLibrary="FontAwesome"
                        iconColor="#fff"
                      />
                      <ButtonHealth 
                        title="Iniciar Sesión" 
                        onPress={toggleRegistering} 
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {/* Campos de Inicio de Sesión */}
                    <View ref={inputRefs.email}>
                      <InputComponent
                        placeholder="Correo Electrónico"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        iconName="email"
                        iconLibrary="MaterialIcons"
                        iconColor="#000"
                        keyboardType="email-address"
                        onFocus={() => scrollToInput(inputRefs.email)}
                        errorMessage={touched.email && errors.email}
                      />
                    </View>

                    <View ref={inputRefs.password}>
                      <InputComponent
                        placeholder="Contraseña"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        iconName="lock"
                        iconLibrary="Entypo"
                        secureTextEntry={true}
                        iconColor="#000"
                        onFocus={() => scrollToInput(inputRefs.password)}
                        errorMessage={touched.password && errors.password}
                      />
                    </View>

                    <ButtonHealth
                      title="Iniciar Sesión"
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    />

                    <TouchableOpacity onPress={() => setIsForgotPasswordVisible(true)}>
                      <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                      <View style={styles.line} />
                    </View>

                    <View style={styles.buttonRow}>
                      <ButtonHealth
                        title="Google"
                        onPress={signIn}
                        iconName="google"
                        iconLibrary="FontAwesome"
                        iconColor="#fff"
                        backgroundColor="#db4437"
                      />
                      <ButtonHealth 
                        title="Registrarse" 
                        onPress={toggleRegistering} 
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alertas Personalizadas */}
      <AlertCustom
        visible={alertaVisible}
        onClose={() => setAlertaVisible(false)}
        title="ERROR"
        confirmText="Aceptar"
        message={mensajeAlerta}
        type="error"
      />
      <AlertCustom
        visible={alertaVisibleSucess}
        onClose={() => {
          setAlertaVisibleSucess(false);
        }}
        title="¡Perfecto!"
        confirmText="Aceptar"
        message={mensajeAlertaSucess}
        type="success"
      />

      {/* Diálogo para Verificar Cuenta */}
      <Dialog isVisible={isVerifyAccountVisible}>
        <Formik
          initialValues={{ verificationCode: '' }}
          validationSchema={verifyAccountSchema}
          onSubmit={handleVerifyAccount}
        >
          {({ values, errors, handleChange, handleBlur, handleSubmit, isSubmitting, touched }) => (
            <>
              <Dialog.Title title="Verificar Cuenta" />
              <Text style={styles.dialogText}>Ingresa el código de verificación enviado a tu correo.</Text>
              <InputComponent
                placeholder="Código de Verificación"
                value={values.verificationCode}
                onChangeText={handleChange('verificationCode')}
                onBlur={handleBlur('verificationCode')}
                errorMessage={touched.verificationCode && errors.verificationCode}
                iconName="key"
                iconLibrary="MaterialIcons"
                iconColor="#000"
                onFocus={() => scrollToInput(inputRefs.verificationCode)}
              />
              <Dialog.Actions>
                <View style={styles.buttonSeparateForm}>
                  <ButtonHealth 
                    title="Cancelar" 
                    onPress={() => {
                      setIsVerifyAccountVisible(false);
                      setEmailForVerification('');
                    }} 
                  />
                  <ButtonHealth 
                    title="Verificar" 
                    onPress={handleSubmit} 
                    disabled={isSubmitting} 
                  />
                </View>
              </Dialog.Actions>
            </>
          )}
        </Formik>
      </Dialog>

      {/* Diálogo para Restablecer Contraseña */}
      <Dialog isVisible={isResetPasswordVisible}>
        <Formik
          initialValues={{ newPassword: '', confirmNewPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ values, errors, handleChange, handleBlur, handleSubmit, isSubmitting, touched }) => (
            <>
              <Dialog.Title title="Nueva Contraseña" />
              <Text style={styles.dialogText}>Ingresa tu nueva contraseña.</Text>
              <InputComponent
                placeholder="Nueva Contraseña"
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                secureTextEntry={true}
                errorMessage={touched.newPassword && errors.newPassword}
                iconName="lock-reset"
                iconLibrary="MaterialCommunityIcons"
                iconColor="#000"
                onFocus={() => scrollToInput(inputRefs.newPassword)}
              />
              <InputComponent
                placeholder="Confirmar Nueva Contraseña"
                value={values.confirmNewPassword}
                onChangeText={handleChange('confirmNewPassword')}
                onBlur={handleBlur('confirmNewPassword')}
                secureTextEntry={true}
                errorMessage={touched.confirmNewPassword && errors.confirmNewPassword}
                iconName="lock-check"
                iconLibrary="MaterialCommunityIcons"
                iconColor="#000"
                onFocus={() => scrollToInput(inputRefs.confirmNewPassword)}
              />
               <InputComponent
                placeholder="Ingrese el codigo"
                value={values.codigo}
                onChangeText={handleChange('codigo')}
                onBlur={handleBlur('codigo')}
                errorMessage={touched.codigo && errors.codigo}
                iconName="key"
                iconLibrary="MaterialCommunityIcons"
                iconColor="#000"
                onFocus={() => scrollToInput(inputRefs.codigo)}
              />
              <Dialog.Actions>
                <View style={styles.buttonSeparateForm}>
                  <ButtonHealth 
                    title="Cancelar" 
                    onPress={() => {
                      setIsResetPasswordVisible(false);
                      setEmailForReset('');
                    }} 
                  />
                  <ButtonHealth 
                    title="Restablecer" 
                    onPress={handleSubmit} 
                    disabled={isSubmitting} 
                  />
                </View>
              </Dialog.Actions>
            </>
          )}
        </Formik>
      </Dialog>

      <Dialog isVisible={isForgotPasswordVisible}>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleRequestReset}
        >
          {({ values, errors, handleChange, handleBlur, handleSubmit, isSubmitting, touched }) => (
            <>
              <Dialog.Title title="Nueva Contraseña" />
              <Text style={styles.dialogText}>Ingrese su email.</Text>
              <InputComponent
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                errorMessage={touched.email && errors.email}
                iconName="lock-reset"
                iconLibrary="MaterialCommunityIcons"
                iconColor="#000"
                onFocus={() => scrollToInput(inputRefs.email)}
              />
              <Dialog.Actions>
                <View style={styles.buttonSeparateForm}>
                  <ButtonHealth 
                    title="Cancelar" 
                    onPress={() => {
                      setIsForgotPasswordVisible(false);
                      setEmailForReset('');
                    }} 
                  />
                  <ButtonHealth 
                    title="Restablecer" 
                    onPress={handleSubmit} 
                    disabled={isSubmitting} 
                  />
                </View>
              </Dialog.Actions>
            </>
          )}
        </Formik>
      </Dialog>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 15,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 10,
    borderRadius: 3,
  },
  checkedBox: {
    backgroundColor: '#000',
  },
  rememberText: {
    color: '#000',
    fontSize: 16,
  },
  forgotText: {
    color: '#000',
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginVertical: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  halfSelector: {
    width: '98%',
    marginHorizontal: 5,
  },
  buttonSeparate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  buttonSeparateForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  dropdown: {
    marginTop: 10,
  },
  dialogText: {
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePicker: {
    marginVertical: 10,
  },
});

export default LoginComponente;
