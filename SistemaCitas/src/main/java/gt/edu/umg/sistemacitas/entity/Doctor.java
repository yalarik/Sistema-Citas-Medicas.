package gt.edu.umg.sistemacitas.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctores")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroColegiado;

    @Column(length = 500)
    private String biografia;

    @OneToOne
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            unique = true
    )
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(
            name = "especialidad_id",
            nullable = false
    )
    private Especialidad especialidad;

    public Doctor() {
    }

    public Doctor(
            Long id,
            String numeroColegiado,
            String biografia,
            Usuario usuario,
            Especialidad especialidad) {

        this.id = id;
        this.numeroColegiado = numeroColegiado;
        this.biografia = biografia;
        this.usuario = usuario;
        this.especialidad = especialidad;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroColegiado() {
        return numeroColegiado;
    }

    public void setNumeroColegiado(
            String numeroColegiado) {

        this.numeroColegiado = numeroColegiado;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(
            String biografia) {

        this.biografia = biografia;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(
            Usuario usuario) {

        this.usuario = usuario;
    }

    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(
            Especialidad especialidad) {

        this.especialidad = especialidad;
    }
}