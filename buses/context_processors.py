def ad(request):
    if (
        not request.user.is_anonymous
        or request.path.startswith("/vehicles/")
        or request.path.startswith("/accounts/")
        or request.path.startswith("/fares/")
    ):
        return {"ad": False}
    return {"ad": True}