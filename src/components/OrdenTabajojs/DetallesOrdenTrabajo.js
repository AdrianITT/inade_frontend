import React, { useEffect, useState } from "react";
import { Table, Button, Card, Dropdown, Menu, message } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import "./cssOrdenTrabajo/DetallesOrdenTrabajo.css"; // Asegúrate de importar el archivo CSS
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi";
import { getClienteById } from "../../apis/ClienteApi";
import { getEmpresaById } from "../../apis/EmpresaApi";
import { getServicioById } from "../../apis/ServiciosApi";
import { getCotizacionById } from "../../apis/CotizacionApi";
import { getReceptorByI } from "../../apis/ResectorApi";
import {  getAllOrdenesTrabajoServicio } from "../../apis/OrdenTabajoServiciosApi";
import { getMetodoById } from "../../apis/MetodoApi";
import { Api_Host } from "../../apis/api";

const DetalleOrdenTrabajo = () => {
  const { orderId } = useParams();

  // Estados para almacenar cada parte de la información
  const [orderHeader, setOrderHeader] = useState(null); // Datos de la tabla "ordentrabajo"
  //const [receptorData, setReceptorData] = useState(null); // Datos del receptor (tabla "clientes")
  //const [companyData, setCompanyData] = useState(null); // Datos de la empresa (tabla "empresa")
  const [servicesData, setServicesData] = useState([]); // Datos de los servicios (tabla "servicio")
  const [cotizacionData, setCotizacionData] = useState([]); // Datos de la cotización
  const [clientData, setClientData] = useState(null); // Datos del cliente (que contiene el id de la empresa)
  const [recep, setRecep] = useState(null);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Orden de trabajo
        const responseHeader = await getOrdenTrabajoById(orderId);
        const header = responseHeader.data;
        setOrderHeader(header);
  
        // 2. Cotización
        const responseCotizacion = await getCotizacionById(header.cotizacion);
        const cotizacion = responseCotizacion.data;
        setCotizacionData(cotizacion);
  
        // 3. Cliente
        const responseClient = await getClienteById(cotizacion.cliente);
        const client = responseClient.data;
        setClientData(client);
  
        // 4. Empresa
        const responseEmpresa = await getEmpresaById(client.empresa);
        setEmpresa(responseEmpresa.data);
  
        // 5. Receptor
        const responseReceptor = await getReceptorByI(header.receptor);
        setRecep(responseReceptor.data);
  
        // 6. Obtener la **tabla intermedia** "ordenTrabajoServicio" según el id de la orden:
        //const relationResponse = await getOrdenTrabajoServiciosByOrden(orderId);
        const relationResponseD = await getAllOrdenesTrabajoServicio();

        //Verificar si la respuesta contiene datos válidos
        if (!relationResponseD || !Array.isArray(relationResponseD.data)) {
          console.error(" Error: La respuesta de la API no es un array:", relationResponseD);
          return;
        }

        // Filtrar los registros que coincidan con el ID de la orden de trabajo
        const dataRelati = relationResponseD.data.filter(orden => String(orden.ordenTrabajo) === String(orderId));

        // Si no hay coincidencias, mostrar un mensaje de advertencia
        if (dataRelati.length === 0) {
          console.warn("⚠ No se encontraron registros en 'ordenTrabajoServicio' con el ID:", orderId);
        }

        // Asignar a `relationData` y continuar con el procesamiento
        let relationData = dataRelati;
  
        // Asegurarse de que relationData sea un arreglo
        if (!Array.isArray(relationData)) {
          relationData = [relationData]; // Si no es un arreglo, convertirlo a uno
        }
  
        // 7. Para cada elemento en "relationData", obtenemos el servicio y combinamos datos:
        const combinedPromises = relationData.map(async (rel) => {
          // Obtén el servicio (tabla "servicio")
          const servResp = await getServicioById(rel.servicio);
          const servData = servResp.data;

          // (Opcional) Si requieres el método, puedes obtenerlo:
          const metodoResp = await getMetodoById(servData.metodos);
          const metodoData = metodoResp.data;

          // Unificamos la información en un solo objeto
          return {
            idServicio: rel.servicio, // Agregamos el id del servicio proveniente de ordenTrabajoServicio
            nombreServicio: servData.nombreServicio, // Datos de la tabla "servicio"
            precio: servData.precio,                  // Datos de la tabla "servicio"
            cantidad: rel.cantidad,                   // Datos de la tabla "ordenTrabajoServicio"
            notas: rel.descripcion,                   // Datos de la tabla "ordenTrabajoServicio"
            metodo: metodoData.codigo,                // Si deseas mostrar el método
          };
        });
  
        // 8. Ejecutar todas las promesas y asignar a servicesData
        const combinedData = await Promise.all(combinedPromises);
        setServicesData(combinedData);
  
      } catch (error) {
        console.error("Error al obtener la información:", error);
      }
    };
  
    fetchData();
  }, [orderId]);
  

  const columnasServicios = [
    {
      title: "Nombre del servicio",
      dataIndex: "nombreServicio",
      key: "servicio",
    },
    
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
    },
    {
      title: "Notas",
      dataIndex: "notas",
      key: "notas",
    },{
      title: "Método",
      dataIndex: "metodo",
      key: "metodo",
    },
  ];
  const handleDownloadPDF = async () => {
    //setLoading(true); // Activar el estado de carga

    try {
      // Abrir el PDF en una nueva pestaña
      window.open(Api_Host.defaults.baseURL+`/ordentrabajo/${orderId}/pdf`);

      // Si la respuesta es exitosa, puedes procesarla
      message.success("PDF descargado correctamente");
      //setLoading(false); // Desactivar el estado de carga
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("Hubo un error al descargar el PDF");
      //setLoading(false); // Desactivar el estado de carga
    }
  };

  const menu = (
    <Menu>
      <Link to={`/detalles_cotizaciones/${cotizacionData.id}`}>
        <Menu.Item key="1" icon={<span><RightCircleTwoTone /></span>}>
          Ir a cotización
        </Menu.Item>
      </Link>
      <Link to={`/CrearFactura/${orderId}`}>
        <Menu.Item key="2" icon={<span><FileTextTwoTone /></span>}>
          detalles de Facturar
        </Menu.Item>
      </Link>
      <Menu.Item key="3" icon={<span><FilePdfTwoTone /></span>} onClick={handleDownloadPDF}>
        Ver PDF
      </Menu.Item>
      <Menu.Item key="4" icon={<span><MailTwoTone /></span>}>
        Enviar Orden de Trabajo
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="container">
      <h1 className="page-title">Detalles de la Orden de Trabajo: {orderHeader?.codigo || orderId}</h1>
      <div className="button-container">
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Button type="primary" className="action-button">
            Acciones para orden de trabajo
          </Button>
        </Dropdown>
      </div>

      <Card className="info-card" title="Información" bordered={false}>
        {orderHeader && clientData && recep && empresa && (
          <>
            <p>
              <strong>Cliente:</strong> {`${clientData.nombrePila} ${clientData.apPaterno} ${clientData.apMaterno}`}
            </p>
            <p>
              <strong>Receptor:</strong> {`${recep.nombrePila} ${recep.apPaterno} ${recep.apMaterno}`}
            </p>
            <p>
              <strong>Dirección:</strong> {`${empresa.calle} ${empresa.numero}, ${empresa.colonia}, ${empresa.ciudad}`}
            </p>
            <p>
              <strong>Estado:</strong> {orderHeader.estado}
            </p>
            <p>
              <strong>Comentarios:</strong> {orderHeader.comentarios || ""}
            </p>
          </>
        )}
      </Card>
      <h2 className="concepts-title">Conceptos Asociados</h2>
      <Table
        className="services-table"
        dataSource={servicesData}
        columns={columnasServicios}
        bordered
        pagination={false}
        rowKey={(record) => record.idServicio}// O si tu record tiene id
      />
    </div>
  );
};

export default DetalleOrdenTrabajo;
