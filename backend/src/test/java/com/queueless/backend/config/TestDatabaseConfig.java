package com.queueless.backend.config;

import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@TestConfiguration
public class TestDatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() throws Exception {
        DataSource dataSource = Mockito.mock(DataSource.class);
        Connection connection = Mockito.mock(Connection.class);
        DatabaseMetaData metaData = Mockito.mock(DatabaseMetaData.class);

        Mockito.when(dataSource.getConnection()).thenReturn(connection);
        Mockito.when(dataSource.getConnection(ArgumentMatchers.anyString(), ArgumentMatchers.anyString())).thenReturn(connection);
        Mockito.when(connection.getMetaData()).thenReturn(metaData);
        Mockito.when(connection.getAutoCommit()).thenReturn(true);
        Mockito.when(connection.getSchema()).thenReturn("public");
        Mockito.when(connection.getCatalog()).thenReturn(null);
        Mockito.when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        Mockito.when(metaData.getDatabaseProductVersion()).thenReturn("14.0");
        Mockito.when(metaData.getDriverName()).thenReturn("PostgreSQL JDBC Driver");
        Mockito.when(metaData.getDriverVersion()).thenReturn("42.7.4");

        return dataSource;
    }
}
