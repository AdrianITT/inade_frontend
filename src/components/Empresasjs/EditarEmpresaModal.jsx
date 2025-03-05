// EditEmpresaModal.jsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import './Empresa.css';


const EditEmpresaModal = ({ visible, onCancel, onEdit, regimenFiscal, empresa,usosCfdi }) => {
  const [form] = Form.useForm();

  // Cuando cambie la empresa a editar, setear los valores iniciales
  useEffect(() => {
    if (empresa) {
      form.setFieldsValue({
        nombre: empresa.nombre,
        rfc: empresa.rfc,
        regimenFiscal: empresa.regimenFiscal,
        condicionPago: empresa.condicionPago,
        calle: empresa.calle,
        numero: empresa.numero,
        colonia: empresa.colonia,
        ciudad: empresa.ciudad,
        codigoPostal: empresa.codigoPostal,
        estado: empresa.estado,
        UsoCfdi:empresa.UsoCfdi,
      });
    }
  }, [empresa, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onEdit(values, form);
    } catch (error) {
      console.log("Error al validar formulario de edición:", error);
    }
  };

  return (
    <Modal
      title="Editar Empresa"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Guardar cambios"
      cancelText="Cancelar"
      width={800}
    >
      <Form
        form={form}
        name="editEmpresa"
        labelCol={{ flex: '150px' }}
        labelAlign="left"
        labelWrap
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: '100%' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre de Empresa"
              name="nombre"
              rules={[{ required: true, message: 'Nombre requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="RFC"
              name="rfc"
              rules={[{ required: true, message: 'RFC requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Regimen fiscal:"
              name="regimenFiscal"
              rules={[{ required: true, message: 'Régimen requerido' }]}
            >
              <Select>
                {regimenFiscal.map((regimen) => (
                  <Select.Option key={regimen.id} value={regimen.id}>
                    {regimen.codigo} - {regimen.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          <Form.Item label="Uso CFDI:" name="UsoCfdi">
              <Select placeholder="Selecciona un Uso CFDI">
                {usosCfdi.map((uso) => (
                  <Select.Option key={uso.id} value={uso.id}>
                    {uso.codigo} - {uso.descripcion}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Calle:"
              name="calle"
              rules={[{ required: true, message: 'Calle requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Numero:"
              name="numero"
              rules={[{ required: true, message: 'Número requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Colonia:"
              name="colonia"
              rules={[{ required: true, message: 'Colonia requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Ciudad:"
              name="ciudad"
              rules={[{ required: true, message: 'Ciudad requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Codigo Postal:"
              name="codigoPostal"
              rules={[{ required: true, message: 'Código postal requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Estado:"
              name="estado"
              rules={[{ required: true, message: 'Estado requerido' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditEmpresaModal;
