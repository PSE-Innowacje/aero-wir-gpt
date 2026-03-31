package pl.pse.aero.domain

import spock.lang.Specification

class UserRoleSpec extends Specification {

    def "should define exactly 4 roles"() {
        expect:
        UserRole.values().length == 4
    }

    def "should contain all required roles"() {
        expect:
        UserRole.values() as Set == [
                UserRole.ADMIN,
                UserRole.PLANNER,
                UserRole.SUPERVISOR,
                UserRole.PILOT
        ] as Set
    }

    def "should resolve role from string name: #name"() {
        expect:
        UserRole.valueOf(name) == expected

        where:
        name           || expected
        "ADMIN"        || UserRole.ADMIN
        "PLANNER"      || UserRole.PLANNER
        "SUPERVISOR"   || UserRole.SUPERVISOR
        "PILOT"        || UserRole.PILOT
    }
}
