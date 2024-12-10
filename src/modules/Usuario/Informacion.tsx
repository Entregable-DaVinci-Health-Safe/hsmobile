import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text, Dialog } from '@rneui/themed';
import { Formik } from 'formik';
import * as Yup from 'yup';
import InputComponent from '../../components/inputs/InputComponent';
import DatePickerComponent from '../../components/inputs/DatePickerComponent';
import { cargarPerfilDesdeAPI } from '../../assets/utils/utils';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import { useLoading } from '../../components/LoadingContext';

interface PerfilDatos {
  activo: boolean;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
  id: number;
  imgPerfil: string | null;
  mail: string;
  nombre: string;
  documento: string;
}

const Informacion: React.FC = () => {
  const [perfilDatos, setPerfilDatos] = useState<PerfilDatos | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const { setLoading } = useLoading();

  const recargarDatosPerfil = async () => {
    setLoading(true);
    try {
      const datosPerfil = await cargarPerfilDesdeAPI();
      setPerfilDatos(datosPerfil);
    } catch (error) {
      console.error('Error al recargar datos del perfil:', error);
    }
    setLoading(false);
  };

  const actualizarPerfil = async (values: { nombre: string; apellido: string; fechaNacimiento: Date }) => {
    setLoading(true);
    try {
      await AxiosHealth.put(`/usuarios/pacientes`, {
        nombre: values.nombre,
        apellido: values.apellido,
        fechaNacimiento: values.fechaNacimiento.toISOString(),
      });
      await recargarDatosPerfil();
      setDialogVisible(false);
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    recargarDatosPerfil();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Card>
        <View style={{ marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Text h4>Nombre</Text>
          <Text>{perfilDatos ? `${perfilDatos.nombre} ${perfilDatos.apellido}` : 'Cargando...'}</Text>
          <View style={styles.lineStyle} />
          <Text h4>Documento</Text>
          <Text>{perfilDatos ? perfilDatos.documento : 'Cargando...'}</Text>
          <View style={styles.lineStyle} />
          <Text h4>Fecha de Nacimiento</Text>
          <Text>{perfilDatos ? perfilDatos.fechaNacimiento : 'Cargando...'}</Text>
          <View style={styles.lineStyle} />
          <Text h4>Genero</Text>
          <Text>{perfilDatos ? perfilDatos.genero : 'Cargando...'}</Text>
          <View style={styles.lineStyle} />
          <Text h4>E-mail</Text>
          <Text>{perfilDatos ? perfilDatos.mail : 'Cargando...'}</Text>
          <View style={styles.boton}>
            <Button size="lg" onPress={() => setDialogVisible(true)}>
              Modificar Datos
            </Button>
          </View>
        </View>
      </Card>

      {/* Diálogo para modificar datos */}
      <Dialog isVisible={dialogVisible} onBackdropPress={() => setDialogVisible(false)}>
        <Dialog.Title title="Modificar Datos" />
        <Formik
          initialValues={{
            nombre: perfilDatos?.nombre || '',
            apellido: perfilDatos?.apellido || '',
            fechaNacimiento: perfilDatos?.fechaNacimiento
              ? new Date(perfilDatos.fechaNacimiento)
              : new Date(),
          }}
          validationSchema={Yup.object({
            nombre: Yup.string().required('El nombre es obligatorio'),
            apellido: Yup.string().required('El apellido es obligatorio'),
            fechaNacimiento: Yup.date().required('La fecha de nacimiento es obligatoria'),
          })}
          onSubmit={actualizarPerfil}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View>
              <InputComponent
                placeholder="Nombre"
                value={values.nombre}
                onChangeText={handleChange('nombre')}
                onBlur={handleBlur('nombre')}
                errorMessage={touched.nombre && errors.nombre ? errors.nombre : undefined}
              />
              <InputComponent
                placeholder="Apellido"
                value={values.apellido}
                onChangeText={handleChange('apellido')}
                onBlur={handleBlur('apellido')}
                errorMessage={touched.apellido && errors.apellido ? errors.apellido : undefined}
              />
              <DatePickerComponent
                date={values.fechaNacimiento}
                setDate={(date) => setFieldValue('fechaNacimiento', date)}
                formatDate={(date) => date.toLocaleDateString()}
                placeholder="Selecciona una fecha"
                errorMessage={touched.fechaNacimiento && errors.fechaNacimiento ? errors.fechaNacimiento : undefined}
              />
              <View style={styles.dialogActions}>
                <Button title="Cancelar" onPress={() => setDialogVisible(false)} />
                <Button title="Guardar" onPress={handleSubmit as () => void} />
              </View>
            </View>
          )}
        </Formik>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  lineStyle: {
    borderWidth: 0.5,
    width: '100%',
    borderColor: 'black',
    marginVertical: 10,
  },
  boton: {
    marginTop: 30,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default Informacion;
